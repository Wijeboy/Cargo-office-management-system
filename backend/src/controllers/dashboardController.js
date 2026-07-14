import { PrismaClient } from '@prisma/client';
import { asyncHandler, formatDate, utilizationPercent } from '../utils/warehouseFormatters.js';

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
  const [incomingCargo, outgoingCargo, users, incidents, storageSections] = await Promise.all([
    prisma.incomingCargo.findMany(),
    prisma.outgoingCargo.findMany({ orderBy: { shipDate: 'desc' }, take: 6 }),
    prisma.user.findMany(),
    prisma.cargoIncident.findMany(),
    prisma.storageSection.findMany(),
  ]);

  const delivered = outgoingCargo.filter((cargo) => cargo.status === 'Delivered').length;
  const inTransit = outgoingCargo.filter((cargo) => cargo.status === 'In Transit').length + incomingCargo.filter((cargo) => cargo.status === 'In Transit').length;
  const delayed = incomingCargo.filter((cargo) => cargo.status === 'Delayed').length + outgoingCargo.filter((cargo) => cargo.status === 'Delayed').length;
  const totalStatus = Math.max(delivered + inTransit + delayed, 1);

  const totalCapacity = storageSections.reduce((sum, section) => sum + section.capacityUnits, 0);
  const occupied = storageSections.reduce((sum, section) => sum + section.occupiedUnits, 0);

  const shipmentVolume = Array.from({ length: 7 }, (_, index) => {
    const day = startOfDay(6 - index);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const count = outgoingCargo.filter((cargo) => cargo.shipDate && cargo.shipDate >= day && cargo.shipDate < nextDay).length;
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      count,
    };
  });

  res.json({
    status: 'success',
    dashboard: {
      stats: {
        totalShipments: incomingCargo.length + outgoingCargo.length,
        activeUsers: users.filter((user) => user.status).length,
        pendingDeliveries: outgoingCargo.filter((cargo) => cargo.status !== 'Delivered').length,
        openIncidents: incidents.filter((incident) => incident.status !== 'Resolved').length,
        storageOccupancyRate: utilizationPercent(occupied, totalCapacity),
      },
      shipmentVolume,
      systemHealth: {
        efficiency: Math.round((delivered / Math.max(outgoingCargo.length, 1)) * 100),
        deliveredPercent: Math.round((delivered / totalStatus) * 100),
        inTransitPercent: Math.round((inTransit / totalStatus) * 100),
        delayedPercent: Math.round((delayed / totalStatus) * 100),
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
