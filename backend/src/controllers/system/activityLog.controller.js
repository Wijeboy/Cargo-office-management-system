import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, module, userId, startDate, endDate } = req.query;
    
    const where = {};
    if (module) where.module = module;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs.map(log => ({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
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

export const createActivityLog = async (req, res) => {
  try {
    const log = await prisma.activityLog.create({
      data: {
        userId: req.user?.id || req.body.userId,
        userName: req.user?.name || req.body.userName,
        action: req.body.action,
        module: req.body.module,
        description: req.body.description,
        metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null,
        ipAddress: req.ip || req.body.ipAddress,
      },
    });
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalActivities, moduleStats] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.groupBy({
        by: ['module'],
        where,
        _count: { module: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalActivities,
        byModule: moduleStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
