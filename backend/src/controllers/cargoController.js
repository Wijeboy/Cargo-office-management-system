import { PrismaClient, Prisma } from '@prisma/client';
import { asyncHandler, formatDate, formatWeight, parseDate, parseInteger, parseNumber } from '../utils/warehouseFormatters.js';

const prisma = new PrismaClient();

function statusTone(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('delayed') || value.includes('critical')) return 'red';
  if (value.includes('soon') || value.includes('transit')) return 'blue';
  if (value.includes('delivered')) return 'green';
  return 'yellow';
}

function incomingPayload(body) {
  return {
    cargoCode: body.cargoCode || body.id || body.code,
    senderCompany: body.senderCompany || body.company,
    origin: body.origin || body.from,
    itemName: body.itemName || body.item,
    quantity: parseInteger(body.quantity),
    quantityUnit: body.quantityUnit || 'units',
    weight: parseNumber(body.weight),
    weightUnit: body.weightUnit || 'kg',
    progress: Math.min(100, Math.max(0, parseInteger(body.progress))),
    status: body.status || 'In Transit',
    expectedArrival: parseDate(body.expectedArrival || body.date),
    notes: body.notes || null,
  };
}

function outgoingPayload(body) {
  return {
    shipmentCode: body.shipmentCode || body.id || body.code,
    consignee: body.consignee,
    destination: body.destination,
    itemName: body.itemName || body.item,
    quantity: parseInteger(body.quantity),
    quantityUnit: body.quantityUnit || 'units',
    weight: parseNumber(body.weight),
    weightUnit: body.weightUnit || 'kg',
    shipDate: parseDate(body.shipDate || body.date),
    status: body.status || 'Processing',
    trackingId: body.trackingId,
    notes: body.notes || null,
  };
}

function toIncomingDto(cargo) {
  return {
    ...cargo,
    idLabel: cargo.cargoCode,
    company: cargo.senderCompany,
    from: cargo.origin,
    item: cargo.itemName,
    quantityLabel: `${cargo.quantity.toLocaleString('en-US')} ${cargo.quantityUnit}`,
    weightLabel: formatWeight(cargo.weight, cargo.weightUnit),
    dateLabel: formatDate(cargo.expectedArrival),
    tone: statusTone(cargo.status),
  };
}

function toOutgoingDto(cargo) {
  return {
    ...cargo,
    weightLabel: formatWeight(cargo.weight, cargo.weightUnit),
    shipDateLabel: formatDate(cargo.shipDate),
    tableRow: [
      cargo.shipmentCode,
      cargo.consignee,
      cargo.destination,
      cargo.itemName,
      formatWeight(cargo.weight, cargo.weightUnit),
      formatDate(cargo.shipDate),
      cargo.status,
      cargo.trackingId,
    ],
  };
}

function containsSearch(search, fields) {
  if (!search) return {};
  return { OR: fields.map((field) => ({ [field]: { contains: search } })) };
}

export const listIncomingCargo = asyncHandler(async (req, res) => {
  const cargo = await prisma.incomingCargo.findMany({
    where: containsSearch(req.query.search, ['cargoCode', 'senderCompany', 'origin', 'itemName', 'status']),
    orderBy: { expectedArrival: 'asc' },
  });

  res.json({ status: 'success', cargo: cargo.map(toIncomingDto) });
});

export const getIncomingCargoStats = asyncHandler(async (req, res) => {
  const cargo = await prisma.incomingCargo.findMany();
  const stats = {
    totalIncoming: cargo.length,
    inTransit: cargo.filter((item) => item.status === 'In Transit').length,
    arrivingSoon: cargo.filter((item) => item.status === 'Arriving Soon').length,
    delayed: cargo.filter((item) => item.status === 'Delayed').length,
  };

  res.json({ status: 'success', stats });
});

export const getIncomingCargo = asyncHandler(async (req, res) => {
  const cargo = await prisma.incomingCargo.findUnique({ where: { id: req.params.id } });
  if (!cargo) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Incoming cargo not found.' });
  return res.json({ status: 'success', cargo: toIncomingDto(cargo) });
});

export const createIncomingCargo = asyncHandler(async (req, res) => {
  const data = incomingPayload(req.body);
  if (!data.cargoCode || !data.senderCompany || !data.origin || !data.itemName) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Cargo code, sender company, origin, and item name are required.' });
  }

  try {
    const cargo = await prisma.incomingCargo.create({ data });
    return res.status(201).json({ status: 'success', message: 'Incoming cargo created successfully.', cargo: toIncomingDto(cargo) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Incoming cargo code already exists.' });
    }
    throw error;
  }
});

export const updateIncomingCargo = asyncHandler(async (req, res) => {
  const current = await prisma.incomingCargo.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Incoming cargo not found.' });

  const data = incomingPayload({ ...current, ...req.body });
  try {
    const cargo = await prisma.incomingCargo.update({ where: { id: req.params.id }, data });
    return res.json({ status: 'success', message: 'Incoming cargo updated successfully.', cargo: toIncomingDto(cargo) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Incoming cargo code already exists.' });
    }
    throw error;
  }
});

export const deleteIncomingCargo = asyncHandler(async (req, res) => {
  const current = await prisma.incomingCargo.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Incoming cargo not found.' });

  await prisma.incomingCargo.delete({ where: { id: req.params.id } });
  return res.json({ status: 'success', message: 'Incoming cargo deleted successfully.' });
});

export const listOutgoingCargo = asyncHandler(async (req, res) => {
  const cargo = await prisma.outgoingCargo.findMany({
    where: containsSearch(req.query.search, ['shipmentCode', 'consignee', 'destination', 'itemName', 'trackingId', 'status']),
    orderBy: { shipDate: 'desc' },
  });

  res.json({ status: 'success', cargo: cargo.map(toOutgoingDto) });
});

export const getOutgoingCargoStats = asyncHandler(async (req, res) => {
  const cargo = await prisma.outgoingCargo.findMany();
  const stats = {
    totalOutgoing: cargo.length,
    processing: cargo.filter((item) => item.status === 'Processing').length,
    inTransit: cargo.filter((item) => item.status === 'In Transit').length,
    delivered: cargo.filter((item) => item.status === 'Delivered').length,
  };

  res.json({ status: 'success', stats });
});

export const getOutgoingCargo = asyncHandler(async (req, res) => {
  const cargo = await prisma.outgoingCargo.findUnique({ where: { id: req.params.id } });
  if (!cargo) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Outgoing cargo not found.' });
  return res.json({ status: 'success', cargo: toOutgoingDto(cargo) });
});

export const createOutgoingCargo = asyncHandler(async (req, res) => {
  const data = outgoingPayload(req.body);
  if (!data.shipmentCode || !data.consignee || !data.destination || !data.itemName || !data.trackingId) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Shipment code, consignee, destination, item name, and tracking ID are required.' });
  }

  try {
    const cargo = await prisma.outgoingCargo.create({ data });
    return res.status(201).json({ status: 'success', message: 'Outgoing cargo created successfully.', cargo: toOutgoingDto(cargo) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Shipment code or tracking ID already exists.' });
    }
    throw error;
  }
});

export const updateOutgoingCargo = asyncHandler(async (req, res) => {
  const current = await prisma.outgoingCargo.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Outgoing cargo not found.' });

  const data = outgoingPayload({ ...current, ...req.body });
  try {
    const cargo = await prisma.outgoingCargo.update({ where: { id: req.params.id }, data });
    return res.json({ status: 'success', message: 'Outgoing cargo updated successfully.', cargo: toOutgoingDto(cargo) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Shipment code or tracking ID already exists.' });
    }
    throw error;
  }
});

export const deleteOutgoingCargo = asyncHandler(async (req, res) => {
  const current = await prisma.outgoingCargo.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Outgoing cargo not found.' });

  await prisma.outgoingCargo.delete({ where: { id: req.params.id } });
  return res.json({ status: 'success', message: 'Outgoing cargo deleted successfully.' });
});
