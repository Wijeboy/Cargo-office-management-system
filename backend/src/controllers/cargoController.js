import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const shipmentInclude = {
  customer: true,
  route: true,
  vehicle: true,
  trackingEvents: {
    orderBy: { timestamp: 'asc' },
  },
  warehouseItems: true,
  invoices: true,
};

function safeLower(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function generateEntityId(prefix) {
  const timestamp = Date.now().toString(36).slice(-6).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${randomPart}`;
}

function buildShipmentResponse(shipment) {
  if (!shipment) return null;

  const customerName = shipment.customer?.name || shipment.senderName;
  const customerEmail = shipment.customer?.email || null;

  return {
    id: shipment.id,
    shipmentCode: shipment.shipmentCode,
    customerId: shipment.customerId,
    customerName,
    customerEmail,
    senderName: shipment.senderName,
    senderContact: shipment.senderContact,
    senderAddress: shipment.senderAddress,
    consigneeName: shipment.consigneeName,
    consigneeContact: shipment.consigneeContact,
    consigneeAddress: shipment.consigneeAddress,
    origin: shipment.origin,
    destination: shipment.destination,
    weight: shipment.weight,
    description: shipment.description,
    dimensions: shipment.dimensions,
    shippingMethod: shipment.shippingMethod,
    expectedDeliveryDate: shipment.expectedDeliveryDate,
    status: shipment.status,
    dispatchDate: shipment.dispatchDate,
    deliveryDate: shipment.deliveryDate,
    archivedAt: shipment.archivedAt,
    route: shipment.route ? {
      id: shipment.route.id,
      routeId: shipment.route.routeId,
      startHub: shipment.route.startHub,
      endHub: shipment.route.endHub,
      estimatedDays: shipment.route.estimatedDays,
      isActive: shipment.route.isActive,
    } : null,
    vehicle: shipment.vehicle ? {
      id: shipment.vehicle.id,
      vehicleId: shipment.vehicle.vehicleId,
      type: shipment.vehicle.type,
      capacity: shipment.vehicle.capacity,
      status: shipment.vehicle.status,
      description: shipment.vehicle.description,
    } : null,
    trackingEvents: shipment.trackingEvents.map((event) => ({
      id: event.id,
      location: event.location,
      status: event.status,
      description: event.description,
      timestamp: event.timestamp,
    })),
    warehouseItems: shipment.warehouseItems.map((item) => ({
      id: item.id,
      warehouseLocation: item.warehouseLocation,
      status: item.status,
      barcodeQR: item.barcodeQR,
      storageDate: item.storageDate,
    })),
    invoices: shipment.invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      totalAmount: invoice.totalAmount,
      tax: invoice.tax,
      paymentStatus: invoice.paymentStatus,
      date: invoice.date,
    })),
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
  };
}

function getSearchCondition(search) {
  if (!safeLower(search)) return undefined;

  return {
    OR: [
      { shipmentCode: { contains: search } },
      { senderName: { contains: search } },
      { consigneeName: { contains: search } },
      { origin: { contains: search } },
      { destination: { contains: search } },
      { description: { contains: search } },
    ],
  };
}

async function loadShipments(where = {}) {
  const shipments = await prisma.shipment.findMany({
    where,
    include: shipmentInclude,
    orderBy: { createdAt: 'desc' },
  });

  return shipments.map(buildShipmentResponse);
}

export async function getShipments(req, res) {
  try {
    const { search = '', status = '', sortBy = 'createdAt' } = req.query;
    const where = {
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(getSearchCondition(search) || {}),
    };

    const shipments = await prisma.shipment.findMany({
      where,
      include: shipmentInclude,
      orderBy: sortBy === 'weight' ? { weight: 'desc' } : { createdAt: 'desc' },
    });

    return res.json({
      status: 'success',
      shipments: shipments.map(buildShipmentResponse),
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to fetch shipments.',
      details: error.message,
    });
  }
}

export async function getShipmentById(req, res) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: shipmentInclude,
    });

    if (!shipment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Shipment not found.',
      });
    }

    return res.json({
      status: 'success',
      shipment: buildShipmentResponse(shipment),
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to fetch shipment.',
      details: error.message,
    });
  }
}

export async function createBooking(req, res) {
  const {
    shipmentCode,
    senderName,
    senderContact,
    senderAddress,
    consigneeName,
    consigneeContact,
    consigneeAddress,
    origin,
    destination,
    weight,
    description,
    dimensions,
    shippingMethod,
    expectedDeliveryDate,
    status,
    routeId,
    vehicleId,
  } = req.body;

  if (!senderName || !senderContact || !senderAddress || !consigneeName || !consigneeContact || !consigneeAddress || !origin || !destination || weight === undefined) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Sender, consignee, origin, destination, and weight are required.',
    });
  }

  try {
    const finalShipmentCode = shipmentCode || `LOG-${String(Date.now()).slice(-6)}`;

    const existingShipment = await prisma.shipment.findUnique({
      where: { shipmentCode: finalShipmentCode },
    });

    if (existingShipment) {
      return res.status(409).json({
        status: 409,
        error: 'Conflict',
        message: 'Shipment code already exists.',
      });
    }

    const [route, vehicle] = await Promise.all([
      routeId ? prisma.route.findUnique({ where: { id: routeId } }) : null,
      vehicleId ? prisma.vehicle.findUnique({ where: { id: vehicleId } }) : null,
    ]);

    const customer = await prisma.customer.create({
      data: {
        name: senderName,
        contactNo: senderContact,
        email: `cargo-${finalShipmentCode.toLowerCase()}@logiflow.local`,
        address: senderAddress,
        company: senderName,
      },
    });

    const shipment = await prisma.shipment.create({
      data: {
        shipmentCode: finalShipmentCode,
        customerId: customer.id,
        routeId: route?.id || null,
        vehicleId: vehicle?.id || null,
        senderName,
        senderContact,
        senderAddress,
        consigneeName,
        consigneeContact,
        consigneeAddress,
        origin,
        destination,
        weight: parseNumber(weight),
        description: description || null,
        dimensions: dimensions || null,
        shippingMethod: shippingMethod || null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        status: status || 'PENDING',
      },
      include: shipmentInclude,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Shipment booking created successfully.',
      shipment: buildShipmentResponse(shipment),
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to create shipment booking.',
      details: error.message,
    });
  }
}

export async function updateShipment(req, res) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
    });

    if (!shipment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Shipment not found.',
      });
    }

    const data = {};
    const fields = [
      'senderName', 'senderContact', 'senderAddress',
      'consigneeName', 'consigneeContact', 'consigneeAddress',
      'origin', 'destination', 'description', 'dimensions',
      'shippingMethod', 'status',
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    if (req.body.weight !== undefined) {
      data.weight = parseNumber(req.body.weight, shipment.weight);
    }

    if (req.body.expectedDeliveryDate !== undefined) {
      data.expectedDeliveryDate = req.body.expectedDeliveryDate ? new Date(req.body.expectedDeliveryDate) : null;
    }

    if (req.body.dispatchDate !== undefined) {
      data.dispatchDate = req.body.dispatchDate ? new Date(req.body.dispatchDate) : null;
    }

    if (req.body.deliveryDate !== undefined) {
      data.deliveryDate = req.body.deliveryDate ? new Date(req.body.deliveryDate) : null;
    }

    if (req.body.archivedAt !== undefined) {
      data.archivedAt = req.body.archivedAt ? new Date(req.body.archivedAt) : null;
    }

    if (req.body.routeId !== undefined) {
      data.routeId = req.body.routeId || null;
    }

    if (req.body.vehicleId !== undefined) {
      data.vehicleId = req.body.vehicleId || null;
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data,
      include: shipmentInclude,
    });

    return res.json({
      status: 'success',
      message: 'Shipment updated successfully.',
      shipment: buildShipmentResponse(updatedShipment),
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update shipment.',
      details: error.message,
    });
  }
}

export async function deleteShipment(req, res) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
    });

    if (!shipment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Shipment not found.',
      });
    }

    await prisma.trackingEvent.deleteMany({ where: { shipmentId: shipment.id } });
    await prisma.warehouseItem.deleteMany({ where: { shipmentId: shipment.id } });
    await prisma.invoice.deleteMany({ where: { shipmentId: shipment.id } });
    await prisma.shipment.delete({ where: { id: shipment.id } });

    return res.json({
      status: 'success',
      message: 'Shipment deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete shipment.',
      details: error.message,
    });
  }
}

export async function getTrackingByCode(req, res) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { shipmentCode: req.params.shipmentCode },
      include: shipmentInclude,
    });

    if (!shipment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Tracking record not found.',
      });
    }

    const latestEvent = shipment.trackingEvents.at(-1) || null;

    return res.json({
      status: 'success',
      shipment: buildShipmentResponse(shipment),
      tracking: {
        shipmentName: shipment.shippingMethod ? `${shipment.shippingMethod} Shipment` : 'Cargo Shipment',
        currentLocation: latestEvent?.location || shipment.destination,
        timeline: shipment.trackingEvents.map((event) => ({
          id: event.id,
          label: event.description,
          date: event.timestamp,
          status: event.status,
          location: event.location,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to load tracking information.',
      details: error.message,
    });
  }
}

export async function addTrackingEvent(req, res) {
  const { location, status, description } = req.body;

  if (!location || !status || !description) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Location, status, and description are required.',
    });
  }

  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
    });

    if (!shipment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Shipment not found.',
      });
    }

    const trackingEvent = await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        location,
        status,
        description,
      },
    });

    const updateData = { status };
    if (status === 'DELIVERED') {
      updateData.deliveryDate = new Date();
    }
    if (status === 'IN_TRANSIT' && !shipment.dispatchDate) {
      updateData.dispatchDate = new Date();
    }

    await prisma.shipment.update({
      where: { id: shipment.id },
      data: updateData,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Tracking event added successfully.',
      trackingEvent,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to add tracking event.',
      details: error.message,
    });
  }
}

export async function getRoutes(req, res) {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      status: 'success',
      routes,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to fetch routes.',
      details: error.message,
    });
  }
}

export async function createRoute(req, res) {
  const { routeId, startHub, endHub, estimatedDays, isActive } = req.body;

  if (!startHub || !endHub || estimatedDays === undefined) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Hubs and estimated days are required.',
    });
  }

  try {
    const finalRouteId = routeId || generateEntityId('RTE');

    const existingRoute = await prisma.route.findUnique({
      where: { routeId: finalRouteId },
    });

    if (existingRoute) {
      return res.status(409).json({
        status: 409,
        error: 'Conflict',
        message: 'Route ID already exists.',
      });
    }

    const route = await prisma.route.create({
      data: {
        routeId: finalRouteId,
        startHub,
        endHub,
        estimatedDays: parseNumber(estimatedDays),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Route created successfully.',
      route,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to create route.',
      details: error.message,
    });
  }
}

export async function updateRoute(req, res) {
  try {
    const route = await prisma.route.findUnique({ where: { id: req.params.id } });

    if (!route) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Route not found.',
      });
    }

    const data = {};
    if (req.body.routeId !== undefined) data.routeId = req.body.routeId;
    if (req.body.startHub !== undefined) data.startHub = req.body.startHub;
    if (req.body.endHub !== undefined) data.endHub = req.body.endHub;
    if (req.body.estimatedDays !== undefined) data.estimatedDays = parseNumber(req.body.estimatedDays, route.estimatedDays);
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    const updatedRoute = await prisma.route.update({
      where: { id: route.id },
      data,
    });

    return res.json({
      status: 'success',
      message: 'Route updated successfully.',
      route: updatedRoute,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update route.',
      details: error.message,
    });
  }
}

export async function getVehicles(req, res) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      status: 'success',
      vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to fetch vehicles.',
      details: error.message,
    });
  }
}

export async function createVehicle(req, res) {
  const { vehicleId, type, capacity, status, description } = req.body;

  if (!type || capacity === undefined) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Type and capacity are required.',
    });
  }

  try {
    const finalVehicleId = vehicleId || generateEntityId('VEH');

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicleId: finalVehicleId },
    });

    if (existingVehicle) {
      return res.status(409).json({
        status: 409,
        error: 'Conflict',
        message: 'Vehicle ID already exists.',
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleId: finalVehicleId,
        type,
        capacity: parseNumber(capacity),
        status: status || 'Available',
        description: description || null,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Vehicle created successfully.',
      vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to create vehicle.',
      details: error.message,
    });
  }
}

export async function updateVehicle(req, res) {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });

    if (!vehicle) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Vehicle not found.',
      });
    }

    const data = {};
    if (req.body.vehicleId !== undefined) data.vehicleId = req.body.vehicleId;
    if (req.body.type !== undefined) data.type = req.body.type;
    if (req.body.capacity !== undefined) data.capacity = parseNumber(req.body.capacity, vehicle.capacity);
    if (req.body.status !== undefined) data.status = req.body.status;
    if (req.body.description !== undefined) data.description = req.body.description;

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicle.id },
      data,
    });

    return res.json({
      status: 'success',
      message: 'Vehicle updated successfully.',
      vehicle: updatedVehicle,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update vehicle.',
      details: error.message,
    });
  }
}

export async function getSchedulingDashboard(req, res) {
  try {
    const [unscheduledCargo, vehicles, routes] = await Promise.all([
      prisma.shipment.findMany({
        where: {
          status: 'PENDING',
          vehicleId: null,
          archivedAt: null,
        },
        include: shipmentInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.route.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    return res.json({
      status: 'success',
      unscheduledCargo: unscheduledCargo.map(buildShipmentResponse),
      vehicles,
      routes,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to load scheduling dashboard.',
      details: error.message,
    });
  }
}

export async function assignShipment(req, res) {
  try {
    const shipment = await prisma.shipment.findUnique({ where: { id: req.params.shipmentId } });

    if (!shipment) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Shipment not found.',
      });
    }

    const { routeId, vehicleId, status } = req.body;
    const finalStatus = status || 'IN_TRANSIT';
    const updateData = {
      status: finalStatus,
    };

    if (routeId !== undefined) updateData.routeId = routeId || null;
    if (vehicleId !== undefined) updateData.vehicleId = vehicleId || null;

    if (finalStatus === 'IN_TRANSIT' && !shipment.dispatchDate) {
      updateData.dispatchDate = new Date();
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment.id },
      data: updateData,
      include: shipmentInclude,
    });

    if (vehicleId) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'In Use' },
      });
    }

    const existingEvents = await prisma.trackingEvent.count({ where: { shipmentId: shipment.id } });
    if (existingEvents === 0) {
      await prisma.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          location: shipment.origin,
          status: 'PICKED_UP',
          description: 'Cargo scheduled and picked up for dispatch',
        },
      });
      if (finalStatus === 'IN_TRANSIT') {
        await prisma.trackingEvent.create({
          data: {
            shipmentId: shipment.id,
            location: shipment.origin,
            status: 'IN_TRANSIT',
            description: 'Shipment dispatched and in transit',
          },
        });
      }
    }

    const refreshedShipment = await prisma.shipment.findUnique({
      where: { id: shipment.id },
      include: shipmentInclude,
    });

    return res.json({
      status: 'success',
      message: 'Shipment scheduled successfully.',
      shipment: buildShipmentResponse(refreshedShipment),
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to schedule shipment.',
      details: error.message,
    });
  }
}

export async function getOperationsReport(req, res) {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        trackingEvents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const weeklyShipments = shipments.filter((shipment) => new Date(shipment.createdAt) >= weekAgo);
    const delivered = shipments.filter((shipment) => shipment.status === 'DELIVERED');
    const inTransit = shipments.filter((shipment) => shipment.status === 'IN_TRANSIT');
    const delayed = shipments.filter((shipment) => shipment.status === 'DELAYED');
    const pending = shipments.filter((shipment) => shipment.status === 'PENDING');

    const onTimeDelivered = delivered.filter((shipment) => {
      if (!shipment.expectedDeliveryDate || !shipment.deliveryDate) return true;
      return new Date(shipment.deliveryDate) <= new Date(shipment.expectedDeliveryDate);
    }).length;

    const totalDelivered = Math.max(delivered.length, 1);
    const onTimeRate = ((onTimeDelivered / totalDelivered) * 100).toFixed(1);

    const transitDurations = delivered
      .filter((s) => s.dispatchDate && s.deliveryDate)
      .map((s) => {
        const ms = new Date(s.deliveryDate) - new Date(s.dispatchDate);
        return ms / (1000 * 60 * 60 * 24);
      });
    const avgTransitDays = transitDurations.length
      ? (transitDurations.reduce((sum, d) => sum + d, 0) / transitDurations.length).toFixed(1)
      : '0.0';

    const dailyCounts = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekAgo);
      date.setDate(weekAgo.getDate() + index + 1);
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = weeklyShipments.filter((shipment) => new Date(shipment.createdAt).toDateString() === date.toDateString()).length;
      return { day: label, value: count };
    });

    return res.json({
      status: 'success',
      kpis: [
        { label: 'Total Weekly Shipments', value: String(weeklyShipments.length), trend: 'Live system count', trendUp: true },
        { label: 'On-Time Delivery Rate', value: `${onTimeRate}%`, trend: 'Based on delivered shipments', trendUp: true },
        { label: 'Avg. Transit Time (days)', value: avgTransitDays, trend: 'Calculated from delivered shipments', trendUp: true },
        { label: 'Pending Deliveries', value: String(pending.length), trend: 'Currently awaiting dispatch', trendUp: false },
      ],
      weeklyTrend: dailyCounts,
      deliveryBreakdown: [
        { name: 'Delivered', count: delivered.length, color: '#10b981' },
        { name: 'In Transit', count: inTransit.length, color: '#009adb' },
        { name: 'Delayed', count: delayed.length, color: '#f59e0b' },
      ],
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to generate operations report.',
      details: error.message,
    });
  }
}

export async function getShipmentHistory(req, res) {
  try {
    const { dateRange, customer, status } = req.query;
    const shipments = await prisma.shipment.findMany({
      include: shipmentInclude,
      orderBy: { createdAt: 'desc' },
    });

    const mapStatus = (shipment) => {
      if (shipment.archivedAt) return 'Archived';

      switch (shipment.status) {
        case 'DELIVERED':
          return 'Completed';
        case 'CANCELLED':
          return 'Cancelled';
        case 'IN_TRANSIT':
          return 'In Transit';
        case 'PENDING':
          return 'Pending';
        case 'DELAYED':
          return 'Delayed';
        case 'ARCHIVED':
          return 'Archived';
        default:
          return shipment.status || 'Unknown';
      }
    };

    const filterByDateRange = (shipment) => {
      if (!dateRange) return true;
      const [startStr, endStr] = dateRange.split(' - ').map((value) => value.trim());
      const start = new Date(startStr);
      const end = new Date(endStr);
      end.setHours(23, 59, 59, 999);
      const completedDate = shipment.deliveryDate || shipment.archivedAt || shipment.updatedAt;
      return completedDate >= start && completedDate <= end;
    };

    const filtered = shipments.filter((shipment) => {
      const finalStatus = mapStatus(shipment);
      const customerName = shipment.customer?.name || shipment.senderName;
      if (status && status !== 'Any Status' && finalStatus !== status) return false;
      if (customer && customer !== 'All Customers' && customerName !== customer) return false;
      if (!filterByDateRange(shipment)) return false;
      return true;
    });

    return res.json({
      status: 'success',
      history: filtered.map((shipment) => ({
        id: shipment.id,
        shipmentId: shipment.shipmentCode,
        completedAt: (shipment.deliveryDate || shipment.archivedAt || shipment.updatedAt || new Date()).toISOString(),
        completedDate: (shipment.deliveryDate || shipment.archivedAt || shipment.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        customer: shipment.customer?.name || shipment.senderName,
        route: `${shipment.origin} → ${shipment.destination}`,
        finalStatus: mapStatus(shipment),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to load shipment history.',
      details: error.message,
    });
  }
}
