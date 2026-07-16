import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, resource, userId, startDate, endDate } = req.query;
    
    const where = {};
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: req.user?.id || req.body.userId,
        userName: req.user?.name || req.body.userName,
        action: req.body.action,
        resource: req.body.resource,
        resourceId: req.body.resourceId,
        details: req.body.details ? JSON.stringify(req.body.details) : null,
        ipAddress: req.ip || req.body.ipAddress,
        userAgent: req.headers['user-agent'],
        status: req.body.status || 'SUCCESS',
      },
    });
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalLogs, actionStats, resourceStats] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
      }),
      prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: { resource: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalLogs,
        byAction: actionStats,
        byResource: resourceStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
