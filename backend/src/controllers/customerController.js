import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a customer code such as CUS-20260710-1234.
 */
function generateCustomerCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `CUS-${date}-${randomNumber}`;
}

/**
 * Register a new customer.
 * POST /api/customers/register
 */
export async function registerCustomer(req, res) {
  const {
    name,
    firstName,
    lastName,
    customerType,
    contactNo,
    phone,
    alternativeNumber,
    email,
    address,
    streetAddress,
    city,
    country,
    postalCode,
    company,
    companyName,
    preferredChannel,
  } = req.body;

  const finalName =
    name ||
    `${firstName || ''} ${lastName || ''}`.trim();

  const finalContactNo = contactNo || phone;
  const finalAddress = address || streetAddress;
  const finalCompany = company || companyName || null;

  if (!finalName || !finalContactNo || !email || !finalAddress) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Name, contact number, email, and address are required.',
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingCustomer) {
      return res.status(409).json({
        status: 409,
        error: 'Conflict',
        message: 'A customer with this email address already exists.',
      });
    }

    let customerCode = generateCustomerCode();

    while (
      await prisma.customer.findUnique({
        where: { customerCode },
      })
    ) {
      customerCode = generateCustomerCode();
    }

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        name: finalName,
        firstName: firstName || null,
        lastName: lastName || null,
        customerType: customerType || 'INDIVIDUAL',
        contactNo: finalContactNo,
        alternativeNumber: alternativeNumber || null,
        email: normalizedEmail,
        address: finalAddress,
        city: city || null,
        country: country || null,
        postalCode: postalCode || null,
        company: finalCompany,
        preferredChannel: preferredChannel || 'EMAIL',
        status: 'ACTIVE',
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Customer registered successfully.',
      customer,
    });
  } catch (error) {
    console.error('Customer registration error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to register customer.',
      details: error.message,
    });
  }
}

/**
 * Get all customers.
 * GET /api/customers
 */
export async function getAllCustomers(req, res) {
  const {
    search = '',
    status,
    customerType,
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

  if (customerType) {
    where.customerType = customerType;
  }

  if (search.trim()) {
    where.OR = [
      {
        customerCode: {
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
        contactNo: {
          contains: search.trim(),
        },
      },
      {
        company: {
          contains: search.trim(),
        },
      },
    ];
  }

  try {
    const [customers, totalCustomers] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              shipments: true,
              invoices: true,
              inquiries: true,
              complaints: true,
              feedback: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return res.json({
      status: 'success',
      customers,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalCustomers,
        totalPages: Math.ceil(totalCustomers / pageSize),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve customers.',
      details: error.message,
    });
  }
}

/**
 * Get one customer.
 * GET /api/customers/:id
 */
export async function getCustomerById(req, res) {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        shipments: true,
        invoices: true,
        inquiries: true,
        complaints: true,
        feedback: true,
        notifications: true,
      },
    });

    if (!customer) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Customer not found.',
      });
    }

    return res.json({
      status: 'success',
      customer,
    });
  } catch (error) {
    console.error('Get customer error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve customer.',
      details: error.message,
    });
  }
}

/**
 * Update a customer.
 * PUT /api/customers/:id
 */
export async function updateCustomer(req, res) {
  const { id } = req.params;

  const {
    name,
    firstName,
    lastName,
    customerType,
    contactNo,
    phone,
    alternativeNumber,
    email,
    address,
    streetAddress,
    city,
    country,
    postalCode,
    company,
    companyName,
    preferredChannel,
    status,
  } = req.body;

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Customer not found.',
      });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (firstName !== undefined) updateData.firstName = firstName || null;
    if (lastName !== undefined) updateData.lastName = lastName || null;

    if (
      name === undefined &&
      (firstName !== undefined || lastName !== undefined)
    ) {
      const updatedFirstName =
        firstName !== undefined ? firstName : existingCustomer.firstName;

      const updatedLastName =
        lastName !== undefined ? lastName : existingCustomer.lastName;

      updateData.name =
        `${updatedFirstName || ''} ${updatedLastName || ''}`.trim() ||
        existingCustomer.name;
    }

    if (customerType !== undefined) {
      updateData.customerType = customerType;
    }

    if (contactNo !== undefined || phone !== undefined) {
      updateData.contactNo = contactNo || phone;
    }

    if (alternativeNumber !== undefined) {
      updateData.alternativeNumber = alternativeNumber || null;
    }

    if (address !== undefined || streetAddress !== undefined) {
      updateData.address = address || streetAddress;
    }

    if (city !== undefined) updateData.city = city || null;
    if (country !== undefined) updateData.country = country || null;
    if (postalCode !== undefined) updateData.postalCode = postalCode || null;

    if (company !== undefined || companyName !== undefined) {
      updateData.company = company || companyName || null;
    }

    if (preferredChannel !== undefined) {
      updateData.preferredChannel = preferredChannel;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (
      email !== undefined &&
      email.trim().toLowerCase() !== existingCustomer.email
    ) {
      const normalizedEmail = email.trim().toLowerCase();

      const customerWithEmail = await prisma.customer.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (customerWithEmail) {
        return res.status(409).json({
          status: 409,
          error: 'Conflict',
          message: 'This email address is already used by another customer.',
        });
      }

      updateData.email = normalizedEmail;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      status: 'success',
      message: 'Customer updated successfully.',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('Update customer error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update customer.',
      details: error.message,
    });
  }
}

/**
 * Delete a customer.
 * DELETE /api/customers/:id
 */
export async function deleteCustomer(req, res) {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shipments: true,
            invoices: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Customer not found.',
      });
    }

    if (
      customer._count.shipments > 0 ||
      customer._count.invoices > 0
    ) {
      return res.status(409).json({
        status: 409,
        error: 'Conflict',
        message:
          'This customer cannot be deleted because shipments or invoices are linked to the customer.',
      });
    }

    await prisma.customer.delete({
      where: { id },
    });

    return res.json({
      status: 'success',
      message: 'Customer deleted successfully.',
    });
  } catch (error) {
    console.error('Delete customer error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete customer.',
      details: error.message,
    });
  }
}