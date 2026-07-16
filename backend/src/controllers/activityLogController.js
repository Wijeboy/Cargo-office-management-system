import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

const prisma = new PrismaClient();

// Create activity log
export const createActivityLog = async (req, res) => {
  try {
    const { action, module, description, metadata } = req.body;

    const activityLog = await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action,
        module,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: req.ip,
      },
    });

    return sendSuccess(res, 'Activity logged successfully', activityLog, 201);
  } catch (error) {
    console.error('Create activity log error:', error);
    return sendError(res, 'Failed to create activity log');
  }
};

// Get activity logs with filtering and pagination
export const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      module,
      startDate,
      endDate,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (module) {
      where.module = module;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { description: { contains: search } },
        { module: { contains: search } },
      ];
    }

    const total = await prisma.activityLog.count({ where });

    const logs = await prisma.activityLog.findMany({
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
            avatar: true,
          },
        },
      },
    });

    const formattedLogs = logs.map(log => {
      let metadata = null;
      try {
        if (log.metadata) metadata = JSON.parse(log.metadata);
      } catch (error) {
        console.error('Error parsing metadata:', error);
      }

      return {
        id: log.id,
        action: log.action,
        module: log.module,
        description: log.description,
        metadata,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        user: {
          id: log.user.id,
          username: log.user.username,
          email: log.user.email,
          fullName: `${log.user.firstName} ${log.user.lastName}`,
          avatar: log.user.avatar,
        },
      };
    });

    return sendPaginated(
      res,
      formattedLogs,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Activity logs retrieved successfully'
    );
  } catch (error) {
    console.error('Get activity logs error:', error);
    return sendError(res, 'Failed to retrieve activity logs');
  }
};

// Get activity log by ID
export const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!log) {
      return sendError(res, 'Activity log not found', 404);
    }

    let metadata = null;
    try {
      if (log.metadata) metadata = JSON.parse(log.metadata);
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }

    const logData = {
      id: log.id,
      action: log.action,
      module: log.module,
      description: log.description,
      metadata,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
      user: {
        id: log.user.id,
        username: log.user.username,
        email: log.user.email,
        fullName: `${log.user.firstName} ${log.user.lastName}`,
        avatar: log.user.avatar,
      },
    };

    return sendSuccess(res, 'Activity log retrieved successfully', logData);
  } catch (error) {
    console.error('Get activity log by ID error:', error);
    return sendError(res, 'Failed to retrieve activity log');
  }
};

// Get user activity timeline
export const getUserActivityTimeline = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    const timeline = logs.map(log => {
      let metadata = null;
      try {
        if (log.metadata) metadata = JSON.parse(log.metadata);
      } catch (error) {
        console.error('Error parsing metadata:', error);
      }

      return {
        id: log.id,
        action: log.action,
        module: log.module,
        description: log.description,
        metadata,
        timestamp: log.createdAt,
      };
    });

    return sendSuccess(res, 'User activity timeline retrieved successfully', timeline);
  } catch (error) {
    console.error('Get user activity timeline error:', error);
    return sendError(res, 'Failed to retrieve activity timeline');
  }
};

// Get activity statistics
export const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const totalActivities = await prisma.activityLog.count({ where });

    const activitiesByModule = await prisma.activityLog.groupBy({
      by: ['module'],
      where,
      _count: { module: true },
      orderBy: { _count: { module: 'desc' } },
    });

    const activitiesByUser = await prisma.activityLog.groupBy({
      by: ['userId'],
      where,
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });

    // Get user details
    const userIds = activitiesByUser.map(a => a.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    const activeUsersWithDetails = activitiesByUser.map(item => {
      const user = users.find(u => u.id === item.userId);
      return {
        userId: item.userId,
        count: item._count.userId,
        username: user?.username,
        fullName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      };
    });

    const stats = {
      totalActivities,
      byModule: activitiesByModule.map(item => ({
        module: item.module,
        count: item._count.module,
      })),
      mostActiveUsers: activeUsersWithDetails,
    };

    return sendSuccess(res, 'Activity statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Get activity stats error:', error);
    return sendError(res, 'Failed to retrieve activity statistics');
  }
};

// Delete old activity logs
export const deleteOldActivityLogs = async (req, res) => {
  try {
    const { days } = req.body;

    if (!days || days < 1) {
      return sendError(res, 'Invalid days parameter', 400);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // Log the cleanup
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CLEANUP',
        resource: 'activity_logs',
        metadata: JSON.stringify({ daysOld: days, deletedCount: result.count }),
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return sendSuccess(res, `Deleted ${result.count} activity logs older than ${days} days`, {
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Delete old activity logs error:', error);
    return sendError(res, 'Failed to delete old activity logs');
  }
};
