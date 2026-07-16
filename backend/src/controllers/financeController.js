import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper: parse optional startDate/endDate query params into a Prisma date filter.
 */
function buildDateFilter(startDate, endDate, field = 'date') {
  if (!startDate && !endDate) return {};
  const filter = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) filter.lte = new Date(endDate);
  return { [field]: filter };
}

/**
 * GET /api/finance/dashboard
 * High level snapshot for the Finance Department dashboard:
 * - total revenue (completed payments)
 * - total outstanding (unpaid/partially-paid invoice balance)
 * - total expenses
 * - net profit (revenue - expenses)
 * - invoice status breakdown
 * - expense breakdown by category
 * - recent invoices & recent payments
 */
export async function getDashboardSummary(req, res) {
  try {
    const [invoices, payments, expenses] = await Promise.all([
      prisma.invoice.findMany({ include: { customer: true } }),
      prisma.payment.findMany({ where: { status: 'COMPLETED' } }),
      prisma.expense.findMany(),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOutstanding = Math.max(totalInvoiced - totalRevenue, 0);
    const totalExpenses = expenses
      .filter((e) => e.status !== 'REJECTED')
      .reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Invoice status breakdown
    const invoiceStatusBreakdown = invoices.reduce((acc, inv) => {
      acc[inv.paymentStatus] = (acc[inv.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    // Expense breakdown by category
    const expenseByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Monthly revenue trend (last 6 months, based on payment date)
    const monthlyRevenue = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[key] = 0;
    }
    payments.forEach((p) => {
      const d = new Date(p.paymentDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthlyRevenue) {
        monthlyRevenue[key] += p.amount;
      }
    });

    const recentInvoices = [...invoices]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 5);

    return res.json({
      status: 'success',
      dashboard: {
        totals: {
          totalRevenue: round2(totalRevenue),
          totalInvoiced: round2(totalInvoiced),
          totalOutstanding: round2(totalOutstanding),
          totalExpenses: round2(totalExpenses),
          netProfit: round2(netProfit),
          invoiceCount: invoices.length,
          paymentCount: payments.length,
          expenseCount: expenses.length,
        },
        invoiceStatusBreakdown,
        expenseByCategory: Object.fromEntries(
          Object.entries(expenseByCategory).map(([k, v]) => [k, round2(v)])
        ),
        monthlyRevenueTrend: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
          month,
          revenue: round2(revenue),
        })),
        recentInvoices,
        recentPayments,
      },
    });
  } catch (error) {
    console.error('Error building finance dashboard:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to load finance dashboard.',
      details: error.message,
    });
  }
}

/**
 * GET /api/finance/reports/revenue?startDate=&endDate=
 * Revenue report grouped by payment method, based on completed payments.
 */
export async function getRevenueReport(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        ...buildDateFilter(startDate, endDate, 'paymentDate'),
      },
      include: {
        invoice: { include: { customer: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const byMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {});

    const byCustomer = payments.reduce((acc, p) => {
      const name = p.invoice?.customer?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + p.amount;
      return acc;
    }, {});

    return res.json({
      status: 'success',
      report: {
        type: 'REVENUE',
        period: { startDate: startDate || null, endDate: endDate || null },
        totalRevenue: round2(totalRevenue),
        transactionCount: payments.length,
        breakdownByMethod: Object.fromEntries(
          Object.entries(byMethod).map(([k, v]) => [k, round2(v)])
        ),
        breakdownByCustomer: Object.fromEntries(
          Object.entries(byCustomer).map(([k, v]) => [k, round2(v)])
        ),
        payments,
      },
    });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to generate revenue report.',
      details: error.message,
    });
  }
}

/**
 * GET /api/finance/reports/expenses?startDate=&endDate=&category=
 * Expense report grouped by category.
 */
export async function getExpenseReport(req, res) {
  try {
    const { startDate, endDate, category } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        ...(category && { category }),
        ...buildDateFilter(startDate, endDate, 'expenseDate'),
      },
      orderBy: { expenseDate: 'desc' },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const byStatus = expenses.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      status: 'success',
      report: {
        type: 'EXPENSE',
        period: { startDate: startDate || null, endDate: endDate || null },
        totalExpenses: round2(totalExpenses),
        recordCount: expenses.length,
        breakdownByCategory: Object.fromEntries(
          Object.entries(byCategory).map(([k, v]) => [k, round2(v)])
        ),
        breakdownByStatus: byStatus,
        expenses,
      },
    });
  } catch (error) {
    console.error('Error generating expense report:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to generate expense report.',
      details: error.message,
    });
  }
}

/**
 * GET /api/finance/reports/profit-loss?startDate=&endDate=
 * Profit & Loss report: revenue vs expenses for a period.
 */
export async function getProfitLossReport(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const [payments, expenses] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          ...buildDateFilter(startDate, endDate, 'paymentDate'),
        },
      }),
      prisma.expense.findMany({
        where: {
          status: { not: 'REJECTED' },
          ...buildDateFilter(startDate, endDate, 'expenseDate'),
        },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return res.json({
      status: 'success',
      report: {
        type: 'PROFIT_LOSS',
        period: { startDate: startDate || null, endDate: endDate || null },
        totalRevenue: round2(totalRevenue),
        totalExpenses: round2(totalExpenses),
        netProfit: round2(netProfit),
        profitMargin: round2(profitMargin),
        summary: netProfit >= 0 ? 'PROFIT' : 'LOSS',
      },
    });
  } catch (error) {
    console.error('Error generating profit & loss report:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to generate profit & loss report.',
      details: error.message,
    });
  }
}

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
