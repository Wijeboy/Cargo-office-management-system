import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCustomerDashboard(req, res) {
  const { customerId } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        shipments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        invoices: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        inquiries: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        complaints: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        feedback: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
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

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          {
            customerId,
          },
          {
            recipientEmail: customer.email,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const [
      totalShipments,
      pendingShipments,
      deliveredShipments,
      totalInvoices,
      pendingInvoices,
      totalInquiries,
      openInquiries,
      totalComplaints,
      openComplaints,
      totalFeedback,
      unreadNotifications,
    ] = await Promise.all([
      prisma.shipment.count({
        where: { customerId },
      }),

      prisma.shipment.count({
        where: {
          customerId,
          status: 'PENDING',
        },
      }),

      prisma.shipment.count({
        where: {
          customerId,
          status: 'DELIVERED',
        },
      }),

      prisma.invoice.count({
        where: { customerId },
      }),

      prisma.invoice.count({
        where: {
          customerId,
          paymentStatus: 'PENDING',
        },
      }),

      prisma.inquiry.count({
        where: { customerId },
      }),

      prisma.inquiry.count({
        where: {
          customerId,
          status: {
            in: ['OPEN', 'IN_PROGRESS'],
          },
        },
      }),

      prisma.complaint.count({
        where: { customerId },
      }),

      prisma.complaint.count({
        where: {
          customerId,
          status: {
            in: ['OPEN', 'IN_PROGRESS'],
          },
        },
      }),

      prisma.feedback.count({
        where: { customerId },
      }),

      prisma.notification.count({
        where: {
          OR: [
            {
              customerId,
            },
            {
              recipientEmail: customer.email,
            },
          ],
          isRead: false,
        },
      }),
    ]);

    return res.json({
      status: 'success',
      dashboard: {
        customer: {
          id: customer.id,
          customerCode: customer.customerCode,
          name: customer.name,
          firstName: customer.firstName,
          lastName: customer.lastName,
          customerType: customer.customerType,
          contactNo: customer.contactNo,
          alternativeNumber: customer.alternativeNumber,
          email: customer.email,
          address: customer.address,
          city: customer.city,
          country: customer.country,
          postalCode: customer.postalCode,
          company: customer.company,
          preferredChannel: customer.preferredChannel,
          status: customer.status,
          registrationDate: customer.registrationDate,
        },

        summary: {
          shipments: {
            total: totalShipments,
            pending: pendingShipments,
            delivered: deliveredShipments,
          },
          invoices: {
            total: totalInvoices,
            pending: pendingInvoices,
          },
          inquiries: {
            total: totalInquiries,
            open: openInquiries,
          },
          complaints: {
            total: totalComplaints,
            open: openComplaints,
          },
          feedback: {
            total: totalFeedback,
          },
          notifications: {
            unread: unreadNotifications,
          },
        },

        recentActivity: {
          shipments: customer.shipments,
          invoices: customer.invoices,
          inquiries: customer.inquiries,
          complaints: customer.complaints,
          feedback: customer.feedback,
          notifications,
        },
      },
    });
  } catch (error) {
    console.error('Customer dashboard error:', error);

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to load customer dashboard.',
      details: error.message,
    });
  }
}