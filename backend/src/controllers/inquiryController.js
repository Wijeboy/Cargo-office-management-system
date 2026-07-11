import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateInquiryNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `INQ-${date}-${randomNumber}`;
}

async function createUniqueInquiryNumber() {
  let inquiryNo = generateInquiryNumber();

  while (
    await prisma.inquiry.findUnique({
      where: { inquiryNo },
    })
  ) {
    inquiryNo = generateInquiryNumber();
  }

  return inquiryNo;
}

/**
 * Submit a new inquiry.
 * Registered and unregistered users can submit inquiries.
 * POST /api/inquiries
 */
export async function createInquiry(req, res) {
  const {
    customerId,
    name,
    email,
    contactNo,
    subject,
    message,
    category,
    priority,
  } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Name, email, subject, and message are required.',
    });
  }

  try {
    let validCustomerId = null;

    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: 'The selected customer was not found.',
        });
      }

      validCustomerId = customerId;
    }

    const inquiryNo = await createUniqueInquiryNumber();

    const inquiry = await prisma.inquiry.create({
      data: {
        inquiryNo,
        customerId: validCustomerId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contactNo: contactNo || null,
        subject: subject.trim(),
        message: message.trim(),
        category: category || null,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        customer: true,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Inquiry submitted successfully.',
      inquiry,
    });
  } catch (error) {
    console.error('Create inquiry error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to submit inquiry.',
      details: error.message,
    });
  }
}

/**
 * Get all inquiries.
 * GET /api/inquiries
 */
export async function getAllInquiries(req, res) {
  const {
    search = '',
    status,
    priority,
    category,
    page = '1',
    limit = '20',
  } = req.query;

  const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(limit, 10) || 20, 1),
    100,
  );

  const where = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (category) {
    where.category = category;
  }

  if (search.trim()) {
    where.OR = [
      {
        inquiryNo: {
          contains: search.trim(),
        },
      },
      {
        name: {
          contains: search.trim(),
        },
      },
      {
        email: {
          contains: search.trim(),
        },
      },
      {
        subject: {
          contains: search.trim(),
        },
      },
      {
        message: {
          contains: search.trim(),
        },
      },
    ];
  }

  try {
    const [inquiries, totalInquiries] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          customer: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inquiry.count({ where }),
    ]);

    return res.json({
      status: 'success',
      inquiries,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalInquiries,
        totalPages: Math.ceil(totalInquiries / pageSize),
      },
    });
  } catch (error) {
    console.error('Get inquiries error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve inquiries.',
      details: error.message,
    });
  }
}

/**
 * Get one inquiry by database ID.
 * GET /api/inquiries/:id
 */
export async function getInquiryById(req, res) {
  const { id } = req.params;

  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!inquiry) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Inquiry not found.',
      });
    }

    return res.json({
      status: 'success',
      inquiry,
    });
  } catch (error) {
    console.error('Get inquiry error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve inquiry.',
      details: error.message,
    });
  }
}

/**
 * Update an inquiry.
 * PUT /api/inquiries/:id
 */
export async function updateInquiry(req, res) {
  const { id } = req.params;

  const {
    customerId,
    name,
    email,
    contactNo,
    subject,
    message,
    category,
    priority,
    status,
    assignedTo,
    response,
  } = req.body;

  try {
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existingInquiry) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Inquiry not found.',
      });
    }

    const updateData = {};

    if (customerId !== undefined) {
      if (!customerId) {
        updateData.customerId = null;
      } else {
        const customer = await prisma.customer.findUnique({
          where: { id: customerId },
        });

        if (!customer) {
          return res.status(404).json({
            status: 404,
            error: 'Not Found',
            message: 'The selected customer was not found.',
          });
        }

        updateData.customerId = customerId;
      }
    }

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      updateData.email = email.trim().toLowerCase();
    }

    if (contactNo !== undefined) {
      updateData.contactNo = contactNo || null;
    }

    if (subject !== undefined) {
      updateData.subject = subject.trim();
    }

    if (message !== undefined) {
      updateData.message = message.trim();
    }

    if (category !== undefined) {
      updateData.category = category || null;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
    }

    if (response !== undefined) {
      updateData.response = response || null;
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });

    return res.json({
      status: 'success',
      message: 'Inquiry updated successfully.',
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error('Update inquiry error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update inquiry.',
      details: error.message,
    });
  }
}

/**
 * Delete an inquiry.
 * DELETE /api/inquiries/:id
 */
export async function deleteInquiry(req, res) {
  const { id } = req.params;

  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Inquiry not found.',
      });
    }

    await prisma.inquiry.delete({
      where: { id },
    });

    return res.json({
      status: 'success',
      message: 'Inquiry deleted successfully.',
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete inquiry.',
      details: error.message,
    });
  }
}