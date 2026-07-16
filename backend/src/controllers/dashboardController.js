import { PrismaClient } from '@prisma/client';
import {
  asyncHandler,
  formatDate,
  utilizationPercent,
} from '../utils/warehouseFormatters.js';

const prisma = new PrismaClient();

function initials(name) {
  return String(name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function startOfDay(daysAgo) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

export const getWarehouseDashboard = asyncHandler(async (req, res) => {
  const [incomingCargo, outgoingCargo, users, incidents, storageSections] =
    await Promise.all([
      prisma.incomingCargo.findMany(),
      prisma.outgoingCargo.findMany({
        orderBy: { shipDate: 'desc' },
        take: 6,
      }),
      prisma.user.findMany(),
      prisma.cargoIncident.findMany(),
      prisma.storageSection.findMany(),
    ]);

  const delivered = outgoingCargo.filter(
    (cargo) => cargo.status === 'Delivered',
  ).length;

  const inTransit =
    outgoingCargo.filter((cargo) => cargo.status === 'In Transit').length +
    incomingCargo.filter((cargo) => cargo.status === 'In Transit').length;

  const delayed =
    incomingCargo.filter((cargo) => cargo.status === 'Delayed').length +
    outgoingCargo.filter((cargo) => cargo.status === 'Delayed').length;

  const totalStatus = Math.max(delivered + inTransit + delayed, 1);

  const totalCapacity = storageSections.reduce(
    (sum, section) => sum + section.capacityUnits,
    0,
  );

  const occupied = storageSections.reduce(
    (sum, section) => sum + section.occupiedUnits,
    0,
  );

  const shipmentVolume = Array.from({ length: 7 }, (_, index) => {
    const day = startOfDay(6 - index);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const count = outgoingCargo.filter(
      (cargo) =>
        cargo.shipDate &&
        cargo.shipDate >= day &&
        cargo.shipDate < nextDay,
    ).length;

    return {
      day: day
        .toLocaleDateString('en-US', { weekday: 'short' })
        .toUpperCase(),
      count,
    };
  });

  res.json({
    status: 'success',
    dashboard: {
      stats: {
        totalShipments: incomingCargo.length + outgoingCargo.length,
        activeUsers: users.filter((user) => user.status).length,
        pendingDeliveries: outgoingCargo.filter(
          (cargo) => cargo.status !== 'Delivered',
        ).length,
        openIncidents: incidents.filter(
          (incident) => incident.status !== 'Resolved',
        ).length,
        storageOccupancyRate: utilizationPercent(
          occupied,
          totalCapacity,
        ),
      },
      shipmentVolume,
      systemHealth: {
        efficiency: Math.round(
          (delivered / Math.max(outgoingCargo.length, 1)) * 100,
        ),
        deliveredPercent: Math.round(
          (delivered / totalStatus) * 100,
        ),
        inTransitPercent: Math.round(
          (inTransit / totalStatus) * 100,
        ),
        delayedPercent: Math.round(
          (delayed / totalStatus) * 100,
        ),
      },
      recentShipments: outgoingCargo.map((cargo) => ({
        orderId: cargo.shipmentCode,
        customerInitials: initials(cargo.consignee),
        customer: cargo.consignee,
        destination: cargo.destination,
        status: cargo.status,
        arrival: formatDate(cargo.shipDate),
        tableRow: [
          cargo.shipmentCode,
          initials(cargo.consignee),
          cargo.consignee,
          cargo.destination,
          cargo.status,
          formatDate(cargo.shipDate),
        ],
      })),
    },
  });
});

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
          { customerId },
          { recipientEmail: customer.email },
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
            { customerId },
            { recipientEmail: customer.email },
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