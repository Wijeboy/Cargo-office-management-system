import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createNotification(req, res) {
  const {
    userId,
    customerId,
    recipientEmail,
    title,
    message,
    type,
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Title and message are required.',
    });
  }

  try {
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: 'User not found.',
        });
      }
    }

    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: 'Customer not found.',
        });
      }
    }

    const notification = await prisma.notification.create({
      data: {
        userId: userId || null,
        customerId: customerId || null,
        recipientEmail: recipientEmail
          ? recipientEmail.trim().toLowerCase()
          : null,
        title: title.trim(),
        message: message.trim(),
        type: type || 'INFO',
        isRead: false,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Notification created successfully.',
      notification,
    });
  } catch (error) {
    console.error('Create notification error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to create notification.',
      details: error.message,
    });
  }
}

export async function getAllNotifications(req, res) {
  const {
    userId,
    customerId,
    recipientEmail,
    type,
    isRead,
    page = '1',
    limit = '20',
  } = req.query;

  const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(limit, 10) || 20, 1),
    100,
  );

  const where = {};

  if (userId) where.userId = userId;
  if (customerId) where.customerId = customerId;
  if (recipientEmail) {
    where.recipientEmail = recipientEmail.trim().toLowerCase();
  }

  if (type) where.type = type;

  if (isRead !== undefined) {
    if (isRead !== 'true' && isRead !== 'false') {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'isRead must be true or false.',
      });
    }

    where.isRead = isRead === 'true';
  }

  try {
    const [notifications, totalNotifications] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ]);

    return res.json({
      status: 'success',
      notifications,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalNotifications,
        totalPages: Math.ceil(totalNotifications / pageSize),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve notifications.',
      details: error.message,
    });
  }
}

export async function getNotificationById(req, res) {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Notification not found.',
      });
    }

    return res.json({
      status: 'success',
      notification,
    });
  } catch (error) {
    console.error('Get notification error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve notification.',
      details: error.message,
    });
  }
}

export async function updateNotification(req, res) {
  const { id } = req.params;

  const {
    userId,
    customerId,
    recipientEmail,
    title,
    message,
    type,
    isRead,
  } = req.body;

  try {
    const existingNotification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Notification not found.',
      });
    }

    const updateData = {};

    if (userId !== undefined) {
      if (!userId) {
        updateData.userId = null;
      } else {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return res.status(404).json({
            status: 404,
            error: 'Not Found',
            message: 'User not found.',
          });
        }

        updateData.userId = userId;
      }
    }

    if (customerId !== undefined) {
      if (!customerId) {
        updateData.customerId = null;
      } else {
        const customer = await prisma.customer.findUnique({
          where: { id: customerId },
        });

        if (!customer) {
          return res.status(404).json({
            status: 404,
            error: 'Not Found',
            message: 'Customer not found.',
          });
        }

        updateData.customerId = customerId;
      }
    }

    if (recipientEmail !== undefined) {
      updateData.recipientEmail = recipientEmail
        ? recipientEmail.trim().toLowerCase()
        : null;
    }

    if (title !== undefined) updateData.title = title.trim();
    if (message !== undefined) updateData.message = message.trim();
    if (type !== undefined) updateData.type = type;
    if (isRead !== undefined) updateData.isRead = Boolean(isRead);

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      status: 'success',
      message: 'Notification updated successfully.',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Update notification error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update notification.',
      details: error.message,
    });
  }
}

export async function markNotificationAsRead(req, res) {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Notification not found.',
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });

    return res.json({
      status: 'success',
      message: 'Notification marked as read.',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to mark notification as read.',
      details: error.message,
    });
  }
}

export async function deleteNotification(req, res) {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Notification not found.',
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return res.json({
      status: 'success',
      message: 'Notification deleted successfully.',
    });
  } catch (error) {
    console.error('Delete notification error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete notification.',
      details: error.message,
    });
  }
}