import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default tax rate applied when a caller does not supply an explicit tax
// amount. Configurable via .env (TAX_RATE=0.08 means 8%).
const DEFAULT_TAX_RATE = process.env.TAX_RATE ? parseFloat(process.env.TAX_RATE) : 0.08;

/**
 * Calculate tax for a given subtotal using either a caller-supplied
 * explicit tax amount, a caller-supplied tax rate, or the system default
 * tax rate as a last resort.
 * @param {number} subtotal
 * @param {number|undefined} explicitTax - exact tax amount, takes priority if provided
 * @param {number|undefined} taxRate - custom rate (e.g. 0.08 for 8%)
 */
function calculateTax(subtotal, explicitTax, taxRate) {
  if (explicitTax !== undefined && explicitTax !== null && explicitTax !== '') {
    return parseFloat(explicitTax);
  }
  const rate = taxRate !== undefined && taxRate !== null ? parseFloat(taxRate) : DEFAULT_TAX_RATE;
  return round2(subtotal * rate);
}

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function parseReceiptItems(notes, shipment, subtotal) {
  let items = [];

  if (notes) {
    try {
      const parsed = JSON.parse(notes);
      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
        items = parsed.items;
      }
    } catch {
      items = [];
    }
  }

  if (items.length > 0) {
    return items.map((item, index) => ({
      id: item.id || `${index}`,
      description: item.description || item.title || `Item ${index + 1}`,
      quantity: Number(item.quantity ?? item.qty ?? 1),
      rate: round2(Number(item.rate ?? 0)),
      amount: round2(Number(item.amount ?? (Number(item.quantity ?? item.qty ?? 1) * Number(item.rate ?? 0)))),
    }));
  }

  const shipmentCode = shipment?.shipmentCode || 'LOG-XXXX';
  return [
    {
      id: 'shipment-service',
      description: `Freight Shipment Delivery (${shipmentCode})`,
      quantity: 1,
      rate: round2(subtotal),
      amount: round2(subtotal),
    },
  ];
}

/**
 * Get a receipt for a paid invoice.
 */
export async function getInvoiceReceipt(req, res) {
  const { id } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        shipment: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Invoice with ID ${id} not found.`,
      });
    }

    if (invoice.paymentStatus !== 'PAID') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Receipt is only available for paid invoices.',
      });
    }

    const payments = await prisma.payment.findMany({
      where: { invoiceId: id, status: 'COMPLETED' },
      orderBy: { paymentDate: 'desc' },
    });

    const latestPayment = payments[0] || null;
    const subtotal = round2(invoice.totalAmount - (invoice.tax || 0));
    const amountPaid = round2(payments.reduce((sum, payment) => sum + payment.amount, 0));
    const balanceDue = round2(Math.max(invoice.totalAmount - amountPaid, 0));
    const change = round2(Math.max(amountPaid - invoice.totalAmount, 0));

    const receipt = {
      receiptNo: latestPayment?.paymentNo ? `RCPT-${latestPayment.paymentNo.replace(/^PAY-/, '')}` : `RCPT-${invoice.invoiceNo.replace(/^INV-/, '')}`,
      invoiceNo: invoice.invoiceNo,
      invoiceDate: invoice.date,
      paymentDate: latestPayment?.paymentDate || invoice.updatedAt || invoice.date,
      paymentMethod: latestPayment?.method || invoice.paymentMethod || 'N/A',
      paymentReference: latestPayment?.reference || null,
      cashier: latestPayment?.paidBy || 'System',
      customer: invoice.customer
        ? {
            id: invoice.customer.id,
            name: invoice.customer.name,
            email: invoice.customer.email,
            contactNo: invoice.customer.contactNo,
            company: invoice.customer.company,
            address: invoice.customer.address,
          }
        : null,
      items: parseReceiptItems(invoice.notes, invoice.shipment, subtotal),
      subtotal,
      tax: round2(invoice.tax || 0),
      taxRate: subtotal > 0 ? round2(((invoice.tax || 0) / subtotal) * 100) : 0,
      totalAmount: round2(invoice.totalAmount),
      amountPaid,
      balanceDue,
      change,
      companyInfo: {
        name: 'LogiFlow',
        tagline: 'Global Logistics Solutions',
        address: 'Head Office, Colombo, Sri Lanka',
        phone: '+94 11 000 0000',
        email: 'accounts@logiflow.com',
      },
    };

    return res.json({
      status: 'success',
      receipt,
    });
  } catch (error) {
    console.error('Error generating invoice receipt:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to generate invoice receipt.',
      details: error.message,
    });
  }
}

/**
 * Get all invoices.
 */
export async function getAllInvoices(req, res) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        shipment: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.json({
      status: 'success',
      invoices,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve invoices.',
      details: error.message,
    });
  }
}

/**
 * Get a single invoice by ID.
 */
export async function getInvoiceById(req, res) {
  const { id } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        shipment: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Invoice with ID ${id} not found.`,
      });
    }

    return res.json({
      status: 'success',
      invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve invoice.',
      details: error.message,
    });
  }
}

/**
 * Get a single invoice by invoiceNo.
 */
export async function getInvoiceByNo(req, res) {
  const { invoiceNo } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNo },
      include: {
        customer: true,
        shipment: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Invoice with number ${invoiceNo} not found.`,
      });
    }

    return res.json({
      status: 'success',
      invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice by number:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve invoice.',
      details: error.message,
    });
  }
}

/**
 * Generate the next sequential invoice number, e.g. INV-1044.
 */
async function generateInvoiceNo() {
  const last = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!last || !last.invoiceNo) return 'INV-1001';

  const match = last.invoiceNo.match(/(\d+)$/);
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1001;
  return `INV-${nextNumber}`;
}

/**
 * Create a new invoice.
 */
export async function createInvoice(req, res) {
  try {
    const {
      shipmentId,
      customerId,
      subtotal,
      totalAmount,
      tax,
      taxRate,
      paymentStatus,
      paymentMethod,
      notes,
      date,
    } = req.body;

    // Accept either an explicit `subtotal`, or fall back to `totalAmount`
    // being treated as the pre-tax amount when no tax is supplied yet.
    const baseAmount = subtotal !== undefined ? parseFloat(subtotal) : totalAmount;

    if (!shipmentId || !customerId || baseAmount === undefined) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'shipmentId, customerId and subtotal (or totalAmount) are required.',
      });
    }

    // Validate shipment exists
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Shipment with ID ${shipmentId} not found.`,
      });
    }

    // Validate customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Customer with ID ${customerId} not found.`,
      });
    }

    const invoiceNo = await generateInvoiceNo();

    const subtotalAmount = parseFloat(baseAmount);
    // Auto-calculate tax (uses explicit `tax`, else `taxRate`, else the
    // system default TAX_RATE) and derive the tax-inclusive grand total.
    const calculatedTax = calculateTax(subtotalAmount, tax, taxRate);
    const grandTotal = round2(subtotalAmount + calculatedTax);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        shipmentId,
        customerId,
        totalAmount: grandTotal,
        tax: calculatedTax,
        paymentStatus: paymentStatus || 'PENDING',
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        customer: true,
        shipment: true,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Invoice created successfully.',
      taxBreakdown: {
        subtotal: subtotalAmount,
        taxRate: tax !== undefined ? null : (taxRate !== undefined ? parseFloat(taxRate) : DEFAULT_TAX_RATE),
        taxAmount: calculatedTax,
        grandTotal,
      },
      invoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to create invoice.',
      details: error.message,
    });
  }
}

/**
 * Update an existing invoice.
 */
export async function updateInvoice(req, res) {
  const { id } = req.params;
  try {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Invoice with ID ${id} not found.`,
      });
    }

    const {
      shipmentId,
      customerId,
      subtotal,
      totalAmount,
      tax,
      taxRate,
      paymentStatus,
      paymentMethod,
      notes,
      date,
    } = req.body;

    if (shipmentId) {
      const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
      if (!shipment) {
        return res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: `Shipment with ID ${shipmentId} not found.`,
        });
      }
    }

    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: `Customer with ID ${customerId} not found.`,
        });
      }
    }

    // If the caller supplies a new `subtotal` or `taxRate`, recalculate tax
    // and the grand total automatically. Otherwise fall back to any
    // explicit `totalAmount` / `tax` values supplied directly (legacy path).
    let recalculated = {};
    if (subtotal !== undefined || taxRate !== undefined) {
      const baseAmount = subtotal !== undefined ? parseFloat(subtotal) : existing.totalAmount - existing.tax;
      const calculatedTax = calculateTax(baseAmount, tax, taxRate);
      recalculated = {
        tax: calculatedTax,
        totalAmount: round2(baseAmount + calculatedTax),
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(shipmentId && { shipmentId }),
        ...(customerId && { customerId }),
        ...(Object.keys(recalculated).length > 0
          ? recalculated
          : {
              ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
              ...(tax !== undefined && { tax: parseFloat(tax) }),
            }),
        ...(paymentStatus && { paymentStatus }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(notes !== undefined && { notes }),
        ...(date && { date: new Date(date) }),
      },
      include: {
        customer: true,
        shipment: true,
      },
    });

    return res.json({
      status: 'success',
      message: 'Invoice updated successfully.',
      invoice,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update invoice.',
      details: error.message,
    });
  }
}

/**
 * Delete an invoice.
 */
export async function deleteInvoice(req, res) {
  const { id } = req.params;
  try {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Invoice with ID ${id} not found.`,
      });
    }

    // Remove dependent payments first to avoid FK constraint errors
    await prisma.payment.deleteMany({ where: { invoiceId: id } });
    await prisma.invoice.delete({ where: { id } });

    return res.json({
      status: 'success',
      message: 'Invoice deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete invoice.',
      details: error.message,
    });
  }
}
