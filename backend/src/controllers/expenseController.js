import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all expenses (optionally filter by category or status via query params).
 */
export async function getAllExpenses(req, res) {
  try {
    const { category, status } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        ...(category && { category }),
        ...(status && { status }),
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    return res.json({
      status: 'success',
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve expenses.',
      details: error.message,
    });
  }
}

/**
 * Get a single expense by ID.
 */
export async function getExpenseById(req, res) {
  const { id } = req.params;
  try {
    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Expense with ID ${id} not found.`,
      });
    }

    return res.json({
      status: 'success',
      expense,
    });
  } catch (error) {
    console.error('Error fetching expense by ID:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve expense.',
      details: error.message,
    });
  }
}

/**
 * Generate the next sequential expense number, e.g. EXP-1001.
 */
async function generateExpenseNo() {
  const last = await prisma.expense.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!last || !last.expenseNo) return 'EXP-1001';

  const match = last.expenseNo.match(/(\d+)$/);
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1001;
  return `EXP-${nextNumber}`;
}

/**
 * Create a new expense record.
 */
export async function createExpense(req, res) {
  try {
    const {
      category,
      title,
      description,
      amount,
      status,
      paymentMethod,
      vendor,
      incurredBy,
      expenseDate,
    } = req.body;

    if (!category || !title || amount === undefined) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'category, title and amount are required.',
      });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Expense amount must be greater than zero.',
      });
    }

    const expenseNo = await generateExpenseNo();

    const expense = await prisma.expense.create({
      data: {
        expenseNo,
        category,
        title,
        description: description || null,
        amount: parseFloat(amount),
        status: status || 'PENDING',
        paymentMethod: paymentMethod || null,
        vendor: vendor || null,
        incurredBy: incurredBy || req.user?.name || null,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Expense created successfully.',
      expense,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to create expense.',
      details: error.message,
    });
  }
}

/**
 * Update an existing expense.
 */
export async function updateExpense(req, res) {
  const { id } = req.params;
  try {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Expense with ID ${id} not found.`,
      });
    }

    const {
      category,
      title,
      description,
      amount,
      status,
      paymentMethod,
      vendor,
      incurredBy,
      expenseDate,
    } = req.body;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(status && { status }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(vendor !== undefined && { vendor }),
        ...(incurredBy !== undefined && { incurredBy }),
        ...(expenseDate && { expenseDate: new Date(expenseDate) }),
      },
    });

    return res.json({
      status: 'success',
      message: 'Expense updated successfully.',
      expense,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update expense.',
      details: error.message,
    });
  }
}

/**
 * Delete an expense.
 */
export async function deleteExpense(req, res) {
  const { id } = req.params;
  try {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Expense with ID ${id} not found.`,
      });
    }

    await prisma.expense.delete({ where: { id } });

    return res.json({
      status: 'success',
      message: 'Expense deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete expense.',
      details: error.message,
    });
  }
}
