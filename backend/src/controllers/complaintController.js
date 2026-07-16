import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateComplaintNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `CMP-${date}-${randomNumber}`;
}

async function createUniqueComplaintNumber() {
  let complaintNo = generateComplaintNumber();

  while (
    await prisma.complaint.findUnique({
      where: { complaintNo },
    })
  ) {
    complaintNo = generateComplaintNumber();
  }

  return complaintNo;
}

export async function createComplaint(req, res) {
  const {
    customerId,
    name,
    email,
    contactNo,
    subject,
    description,
    category,
    priority,
  } = req.body;

  if (!name || !email || !subject || !description) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Name, email, subject, and description are required.',
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

    const complaintNo = await createUniqueComplaintNumber();

    const complaint = await prisma.complaint.create({
      data: {
        complaintNo,
        customerId: validCustomerId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contactNo: contactNo || null,
        subject: subject.trim(),
        description: description.trim(),
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
      message: 'Complaint submitted successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Create complaint error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to submit complaint.',
      details: error.message,
    });
  }
}

export async function getAllComplaints(req, res) {
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

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;

  if (search.trim()) {
    where.OR = [
      { complaintNo: { contains: search.trim() } },
      { name: { contains: search.trim() } },
      { email: { contains: search.trim() } },
      { subject: { contains: search.trim() } },
      { description: { contains: search.trim() } },
    ];
  }

  try {
    const [complaints, totalComplaints] = await Promise.all([
      prisma.complaint.findMany({
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
      prisma.complaint.count({ where }),
    ]);

    return res.json({
      status: 'success',
      complaints,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalComplaints,
        totalPages: Math.ceil(totalComplaints / pageSize),
      },
    });
  } catch (error) {
    console.error('Get complaints error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve complaints.',
      details: error.message,
    });
  }
}

export async function getComplaintById(req, res) {
  const { id } = req.params;

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Complaint not found.',
      });
    }

    return res.json({
      status: 'success',
      complaint,
    });
  } catch (error) {
    console.error('Get complaint error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve complaint.',
      details: error.message,
    });
  }
}

export async function updateComplaint(req, res) {
  const { id } = req.params;

  const {
    customerId,
    name,
    email,
    contactNo,
    subject,
    description,
    category,
    priority,
    status,
    assignedTo,
    resolutionNote,
  } = req.body;

  try {
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!existingComplaint) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Complaint not found.',
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

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) {
      updateData.email = email.trim().toLowerCase();
    }

    if (contactNo !== undefined) {
      updateData.contactNo = contactNo || null;
    }

    if (subject !== undefined) updateData.subject = subject.trim();

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (category !== undefined) {
      updateData.category = category || null;
    }

    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
    }

    if (resolutionNote !== undefined) {
      updateData.resolutionNote = resolutionNote || null;
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });

    return res.json({
      status: 'success',
      message: 'Complaint updated successfully.',
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('Update complaint error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update complaint.',
      details: error.message,
    });
  }
}

export async function deleteComplaint(req, res) {
  const { id } = req.params;

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Complaint not found.',
      });
    }

    await prisma.complaint.delete({
      where: { id },
    });

    return res.json({
      status: 'success',
      message: 'Complaint deleted successfully.',
    });
  } catch (error) {
    console.error('Delete complaint error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete complaint.',
      details: error.message,
    });
  }
}