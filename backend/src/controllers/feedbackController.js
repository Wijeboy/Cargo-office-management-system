import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateFeedbackNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `FDB-${date}-${randomNumber}`;
}

async function createUniqueFeedbackNumber() {
  let feedbackNo = generateFeedbackNumber();

  while (
    await prisma.feedback.findUnique({
      where: { feedbackNo },
    })
  ) {
    feedbackNo = generateFeedbackNumber();
  }

  return feedbackNo;
}

export async function createFeedback(req, res) {
  const {
    customerId,
    name,
    email,
    contactNo,
    rating,
    comment,
    category,
  } = req.body;

  if (!name || !email || rating === undefined || !comment) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Name, email, rating, and comment are required.',
    });
  }

  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Rating must be an integer between 1 and 5.',
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

    const feedbackNo = await createUniqueFeedbackNumber();

    const feedback = await prisma.feedback.create({
      data: {
        feedbackNo,
        customerId: validCustomerId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contactNo: contactNo || null,
        rating: numericRating,
        comment: comment.trim(),
        category: category || null,
        status: 'NEW',
      },
      include: {
        customer: true,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully.',
      feedback,
    });
  } catch (error) {
    console.error('Create feedback error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to submit feedback.',
      details: error.message,
    });
  }
}

export async function getAllFeedback(req, res) {
  const {
    search = '',
    status,
    category,
    rating,
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

  if (category) {
    where.category = category;
  }

  if (rating !== undefined) {
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Rating filter must be an integer between 1 and 5.',
      });
    }

    where.rating = numericRating;
  }

  if (search.trim()) {
    where.OR = [
      {
        feedbackNo: {
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
        comment: {
          contains: search.trim(),
        },
      },
    ];
  }

  try {
    const [feedback, totalFeedback] = await Promise.all([
      prisma.feedback.findMany({
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
      prisma.feedback.count({ where }),
    ]);

    return res.json({
      status: 'success',
      feedback,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalFeedback,
        totalPages: Math.ceil(totalFeedback / pageSize),
      },
    });
  } catch (error) {
    console.error('Get feedback error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve feedback.',
      details: error.message,
    });
  }
}

export async function getFeedbackById(req, res) {
  const { id } = req.params;

  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!feedback) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Feedback not found.',
      });
    }

    return res.json({
      status: 'success',
      feedback,
    });
  } catch (error) {
    console.error('Get feedback error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve feedback.',
      details: error.message,
    });
  }
}

export async function updateFeedback(req, res) {
  const { id } = req.params;

  const {
    customerId,
    name,
    email,
    contactNo,
    rating,
    comment,
    category,
    status,
  } = req.body;

  try {
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Feedback not found.',
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

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: 'Rating must be an integer between 1 and 5.',
        });
      }

      updateData.rating = numericRating;
    }

    if (comment !== undefined) {
      updateData.comment = comment.trim();
    }

    if (category !== undefined) {
      updateData.category = category || null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });

    return res.json({
      status: 'success',
      message: 'Feedback updated successfully.',
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error('Update feedback error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update feedback.',
      details: error.message,
    });
  }
}

export async function deleteFeedback(req, res) {
  const { id } = req.params;

  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Feedback not found.',
      });
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return res.json({
      status: 'success',
      message: 'Feedback deleted successfully.',
    });
  } catch (error) {
    console.error('Delete feedback error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete feedback.',
      details: error.message,
    });
  }
}