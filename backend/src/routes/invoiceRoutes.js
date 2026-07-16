import express from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByNo,
  getInvoiceFormOptions,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceReceipt,
} from '../controllers/invoiceController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply auth token requirement to all invoice routes
router.use(authenticateToken);

// IMPORTANT: this must come before '/:id' or it will be swallowed by it
router.get('/meta/options', getInvoiceFormOptions);

router.get('/', getAllInvoices);
router.get('/:id/receipt', getInvoiceReceipt);
router.get('/no/:invoiceNo', getInvoiceByNo);
router.get('/:id', getInvoiceById);

// Only Admin and Finance can create/update/delete invoices
router.post('/', requireRoles(['ADMIN', 'FINANCE']), createInvoice);
router.put('/:id', requireRoles(['ADMIN', 'FINANCE']), updateInvoice);
router.delete('/:id', requireRoles(['ADMIN', 'FINANCE']), deleteInvoice);

export default router;
