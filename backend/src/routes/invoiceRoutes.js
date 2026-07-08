import express from 'express';
import { getAllInvoices, getInvoiceById, getInvoiceByNo } from '../controllers/invoiceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth token requirement to all invoice routes
router.use(authenticateToken);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.get('/no/:invoiceNo', getInvoiceByNo);

export default router;
