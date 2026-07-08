import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
