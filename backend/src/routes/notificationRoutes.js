import express from 'express';

import {
  createNotification,
  deleteNotification,
  getAllNotifications,
  getNotificationById,
  markNotificationAsRead,
  updateNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// Create notification
router.post('/', createNotification);

// Notification management
router.get('/', getAllNotifications);
router.get('/:id', getNotificationById);
router.put('/:id', updateNotification);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);

export default router;