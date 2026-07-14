import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all payments (optionally filter by invoiceId or status via query params).
 */
export async function getAllPayments(req, res) {
  try {
    const { invoiceId, status } = req.query;

    const payments = await prisma.payment.findMany({
      where: {
        ...(invoiceId && { invoiceId }),
        ...(status && { status }),
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    return res.json({
      status: 'success',
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve payments.',
      details: error.message,
    });
  }
}

/**
 * Get a single payment by ID.
 */
export async function getPaymentById(req, res) {
  const { id } = req.params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Payment with ID ${id} not found.`,
      });
    }

    return res.json({
      status: 'success',
      payment,
    });
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve payment.',
      details: error.message,
    });
  }
}

/**
 * Generate the next sequential payment number, e.g. PAY-1001.
 */
async function generatePaymentNo() {
  const last = await prisma.payment.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!last || !last.paymentNo) return 'PAY-1001';

  const match = last.paymentNo.match(/(\d+)$/);
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1001;
  return `PAY-${nextNumber}`;
}

/**
 * Record a new payment against an invoice.
 * Automatically updates the parent invoice's paymentStatus based on
 * the total amount paid so far (PENDING -> PARTIALLY_PAID -> PAID).
 */
export async function createPayment(req, res) {
  try {
    const { invoiceId, amount, method, status, reference, notes, paidBy, paymentDate } = req.body;

    if (!invoiceId || amount === undefined) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'invoiceId and amount are required.',
      });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Payment amount must be greater than zero.',
      });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Invoice with ID ${invoiceId} not found.`,
      });
    }

    const paymentNo = await generatePaymentNo();

    const payment = await prisma.payment.create({
      data: {
        paymentNo,
        invoiceId,
        amount: parseFloat(amount),
        method: method || 'BANK_TRANSFER',
        status: status || 'COMPLETED',
        reference: reference || null,
        notes: notes || null,
        paidBy: paidBy || req.user?.name || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    // Recalculate invoice payment status based on total completed payments
    const totalPaid = [...invoice.payments, payment]
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    let newStatus = invoice.paymentStatus;
    if (totalPaid >= invoice.totalAmount) {
      newStatus = 'PAID';
    } else if (totalPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    if (newStatus !== invoice.paymentStatus) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { paymentStatus: newStatus, paymentMethod: payment.method },
      });
    }

    const paymentWithInvoice = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: { invoice: true },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Payment recorded successfully.',
      payment: paymentWithInvoice,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to record payment.',
      details: error.message,
    });
  }
}

/**
 * Update an existing payment.
 */
export async function updatePayment(req, res) {
  const { id } = req.params;
  try {
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Payment with ID ${id} not found.`,
      });
    }

    const { amount, method, status, reference, notes, paidBy, paymentDate } = req.body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(method && { method }),
        ...(status && { status }),
        ...(reference !== undefined && { reference }),
        ...(notes !== undefined && { notes }),
        ...(paidBy !== undefined && { paidBy }),
        ...(paymentDate && { paymentDate: new Date(paymentDate) }),
      },
    });

    // Recalculate parent invoice status after edit
    const invoice = await prisma.invoice.findUnique({
      where: { id: payment.invoiceId },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

      let newStatus = 'PENDING';
      if (totalPaid >= invoice.totalAmount) newStatus = 'PAID';
      else if (totalPaid > 0) newStatus = 'PARTIALLY_PAID';

      if (newStatus !== invoice.paymentStatus) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { paymentStatus: newStatus },
        });
      }
    }

    return res.json({
      status: 'success',
      message: 'Payment updated successfully.',
      payment,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update payment.',
      details: error.message,
    });
  }
}

/**
 * Delete a payment and re-sync the parent invoice status.
 */
export async function deletePayment(req, res) {
  const { id } = req.params;
  try {
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Payment with ID ${id} not found.`,
      });
    }

    await prisma.payment.delete({ where: { id } });

    const invoice = await prisma.invoice.findUnique({
      where: { id: existing.invoiceId },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

      let newStatus = 'PENDING';
      if (totalPaid >= invoice.totalAmount) newStatus = 'PAID';
      else if (totalPaid > 0) newStatus = 'PARTIALLY_PAID';

      if (newStatus !== invoice.paymentStatus) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { paymentStatus: newStatus },
        });
      }
    }

    return res.json({
      status: 'success',
      message: 'Payment deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete payment.',
      details: error.message,
    });
  }
}

/**
 * GET /api/payments/:id/receipt
 * Generate a formatted receipt for a completed payment, including
 * invoice/customer details and the invoice's running balance.
 */
export async function generateReceipt(req, res) {
  const { id } = req.params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            customer: true,
            shipment: true,
            payments: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Payment with ID ${id} not found.`,
      });
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'A receipt can only be generated for a completed payment.',
      });
    }

    const invoice = payment.invoice;
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = Math.max(round2(invoice.totalAmount - totalPaid), 0);

    const receipt = {
      receiptNo: `RCPT-${payment.paymentNo.replace(/^PAY-/, '')}`,
      issuedOn: new Date(),
      paidBy: payment.paidBy || invoice.customer?.name || 'N/A',
      paymentDetails: {
        paymentNo: payment.paymentNo,
        amountPaid: round2(payment.amount),
        method: payment.method,
        reference: payment.reference,
        paymentDate: payment.paymentDate,
      },
      invoiceDetails: {
        invoiceNo: invoice.invoiceNo,
        invoiceDate: invoice.date,
        subtotal: round2(invoice.totalAmount - invoice.tax),
        tax: round2(invoice.tax),
        totalAmount: round2(invoice.totalAmount),
        paymentStatus: invoice.paymentStatus,
      },
      customer: invoice.customer
        ? {
            name: invoice.customer.name,
            email: invoice.customer.email,
            company: invoice.customer.company,
            address: invoice.customer.address,
          }
        : null,
      shipment: invoice.shipment
        ? {
            shipmentCode: invoice.shipment.shipmentCode,
            origin: invoice.shipment.origin,
            destination: invoice.shipment.destination,
          }
        : null,
      balanceSummary: {
        totalPaidToDate: round2(totalPaid),
        balanceDue,
      },
    };

    return res.json({
      status: 'success',
      receipt,
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to generate receipt.',
      details: error.message,
    });
  }
}

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
