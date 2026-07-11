import express from 'express';

import {
  createInquiry,
  deleteInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
} from '../controllers/inquiryController.js';

const router = express.Router();

// Public inquiry submission
router.post('/', createInquiry);

// Inquiry management
router.get('/', getAllInquiries);
router.get('/:id', getInquiryById);
router.put('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;