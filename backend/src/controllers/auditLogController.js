import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

const prisma = new PrismaClient();

// Get all audit logs with filtering and pagination
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      resource,
      userId,
      status,
      startDate,
      endDate,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { resource: { contains: search } },
        { resourceId: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.auditLog.count({ where });

    // Get logs
    const logs = await prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Format response
    const formattedLogs = logs.map(log => {
      let oldValue = null;
      let newValue = null;
      let metadata = null;

      try {
        if (log.oldValue) oldValue = JSON.parse(log.oldValue);
        if (log.newValue) newValue = JSON.parse(log.newValue);
        if (log.metadata) metadata = JSON.parse(log.metadata);
      } catch (error) {
        console.error('Error parsing log data:', error);
      }

      return {
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        oldValue,
        newValue,
        status: log.status,
        errorMessage: log.errorMessage,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata,
        createdAt: log.createdAt,
        user: log.user ? {
          id: log.user.id,
          username: log.user.username,
          email: log.user.email,
          fullName: `${log.user.firstName} ${log.user.lastName}`,
        } : null,
      };
    });

    return sendPaginated(
      res,
      formattedLogs,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Audit logs retrieved successfully'
    );
  } catch (error) {
    console.error('Get audit logs error:', error);
    return sendError(res, 'Failed to retrieve audit logs');
  }
};

// Get single audit log
export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!log) {
      return sendError(res, 'Audit log not found', 404);
    }

    // Parse JSON fields
    let oldValue = null;
    let newValue = null;
    let metadata = null;

    try {
      if (log.oldValue) oldValue = JSON.parse(log.oldValue);
      if (log.newValue) newValue = JSON.parse(log.newValue);
      if (log.metadata) metadata = JSON.parse(log.metadata);
    } catch (error) {
      console.error('Error parsing log data:', error);
    }

    const logData = {
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      oldValue,
      newValue,
      status: log.status,
      errorMessage: log.errorMessage,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata,
      createdAt: log.createdAt,
      user: log.user ? {
        id: log.user.id,
        username: log.user.username,
        email: log.user.email,
        fullName: `${log.user.firstName} ${log.user.lastName}`,
      } : null,
    };

    return sendSuccess(res, 'Audit log retrieved successfully', logData);
  } catch (error) {
    console.error('Get audit log by ID error:', error);
    return sendError(res, 'Failed to retrieve audit log');
  }
};

// Get audit statistics
export const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Total logs
    const totalLogs = await prisma.auditLog.count({ where });

    // Logs by action
    const logsByAction = await prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true },
    });

    // Logs by resource
    const logsByResource = await prisma.auditLog.groupBy({
      by: ['resource'],
      where,
      _count: { resource: true },
    });

    // Logs by status
    const logsByStatus = await prisma.auditLog.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    // Most active users
    const mostActiveUsers = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: { ...where, userId: { not: null } },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });

    // Get user details
    const userIds = mostActiveUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const activeUsersWithDetails = mostActiveUsers.map(item => {
      const user = users.find(u => u.id === item.userId);
      return {
        userId: item.userId,
        count: item._count.userId,
        username: user?.username,
        fullName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      };
    });

    const stats = {
      totalLogs,
      byAction: logsByAction.map(item => ({
        action: item.action,
        count: item._count.action,
      })),
      byResource: logsByResource.map(item => ({
        resource: item.resource,
        count: item._count.resource,
      })),
      byStatus: logsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      mostActiveUsers: activeUsersWithDetails,
    };

    return sendSuccess(res, 'Audit statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Get audit stats error:', error);
    return sendError(res, 'Failed to retrieve audit statistics');
  }
};

// Export audit logs (to CSV format data)
export const exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, action, resource } = req.query;

    const where = {};

    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    const exportData = logs.map(log => ({
      id: log.id,
      timestamp: log.createdAt.toISOString(),
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || '',
      username: log.user?.username || 'System',
      email: log.user?.email || '',
      status: log.status,
      ipAddress: log.ipAddress || '',
      errorMessage: log.errorMessage || '',
    }));

    return sendSuccess(res, 'Audit logs exported successfully', exportData);
  } catch (error) {
    console.error('Export audit logs error:', error);
    return sendError(res, 'Failed to export audit logs');
  }
};

// Delete old audit logs
export const deleteOldLogs = async (req, res) => {
  try {
    const { days } = req.body;

    if (!days || days < 1) {
      return sendError(res, 'Invalid days parameter', 400);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // Log the cleanup action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CLEANUP',
        resource: 'audit_logs',
        metadata: JSON.stringify({ daysOld: days, deletedCount: result.count }),
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return sendSuccess(res, `Deleted ${result.count} audit logs older than ${days} days`, {
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Delete old logs error:', error);
    return sendError(res, 'Failed to delete old logs');
  }
};
