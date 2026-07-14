import express from 'express';
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply auth token requirement to all expense routes
router.use(authenticateToken);

router.get('/', getAllExpenses);
router.get('/:id', getExpenseById);

// Only Admin and Finance can create/update/delete expenses
router.post('/', requireRoles(['ADMIN', 'FINANCE']), createExpense);
router.put('/:id', requireRoles(['ADMIN', 'FINANCE']), updateExpense);
router.delete('/:id', requireRoles(['ADMIN', 'FINANCE']), deleteExpense);

export default router;
