import express from 'express';
import {
  getDashboardSummary,
  getRevenueReport,
  getExpenseReport,
  getProfitLossReport,
} from '../controllers/financeController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// All finance dashboard / report routes require login and Admin or Finance role
router.use(authenticateToken);
router.use(requireRoles(['ADMIN', 'FINANCE']));

router.get('/dashboard', getDashboardSummary);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/expenses', getExpenseReport);
router.get('/reports/profit-loss', getProfitLossReport);

export default router;
