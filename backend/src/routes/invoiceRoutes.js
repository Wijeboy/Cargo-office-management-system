import express from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByNo,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoiceController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply auth token requirement to all invoice routes
router.use(authenticateToken);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.get('/no/:invoiceNo', getInvoiceByNo);

// Only Admin and Finance can create/update/delete invoices
router.post('/', requireRoles(['ADMIN', 'FINANCE']), createInvoice);
router.put('/:id', requireRoles(['ADMIN', 'FINANCE']), updateInvoice);
router.delete('/:id', requireRoles(['ADMIN', 'FINANCE']), deleteInvoice);

export default router;
