import express from 'express';

import {
  createComplaint,
  deleteComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
} from '../controllers/complaintController.js';

const router = express.Router();

// Public complaint submission
router.post('/', createComplaint);

// Complaint management
router.get('/', getAllComplaints);
router.get('/:id', getComplaintById);
router.put('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);

export default router;