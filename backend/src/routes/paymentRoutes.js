import express from 'express';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  generateReceipt,
} from '../controllers/paymentController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply auth token requirement to all payment routes
router.use(authenticateToken);

router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.get('/:id/receipt', generateReceipt);

// Only Admin and Finance can create/update/delete payments
router.post('/', requireRoles(['ADMIN', 'FINANCE']), createPayment);
router.put('/:id', requireRoles(['ADMIN', 'FINANCE']), updatePayment);
router.delete('/:id', requireRoles(['ADMIN', 'FINANCE']), deletePayment);

export default router;
