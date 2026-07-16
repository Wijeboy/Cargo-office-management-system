import express from 'express';

import {
  createFeedback,
  deleteFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
} from '../controllers/feedbackController.js';

const router = express.Router();

// Public feedback submission
router.post('/', createFeedback);

// Feedback management
router.get('/', getAllFeedback);
router.get('/:id', getFeedbackById);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export default router;