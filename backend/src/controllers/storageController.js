import { PrismaClient, Prisma } from '@prisma/client';
import { asyncHandler, parseInteger, storageStatus, utilizationPercent } from '../utils/warehouseFormatters.js';

const prisma = new PrismaClient();

function storagePayload(body) {
  const occupiedUnits = parseInteger(body.occupiedUnits);
  const capacityUnits = parseInteger(body.capacityUnits || body.capacity);

  return {
    sectionCode: body.sectionCode || body.code,
    zone: body.zone,
    location: body.location,
    currentItems: body.currentItems || null,
    occupiedUnits,
    capacityUnits,
    status: body.status || storageStatus(occupiedUnits, capacityUnits),
  };
}

function toStorageDto(section) {
  const utilization = utilizationPercent(section.occupiedUnits, section.capacityUnits);
  return {
    ...section,
    utilization,
    capacityLabel: `${section.occupiedUnits}/${section.capacityUnits}`,
    utilizationLabel: `${utilization}%`,
    tableRow: [
      section.sectionCode,
      section.zone,
      section.location,
      section.currentItems || '-',
      `${section.occupiedUnits}/${section.capacityUnits}`,
      `${utilization}%`,
      section.status,
    ],
  };
}

function storageWhere(search) {
  if (!search) return {};
  return {
    OR: [
      { sectionCode: { contains: search } },
      { zone: { contains: search } },
      { location: { contains: search } },
      { currentItems: { contains: search } },
      { status: { contains: search } },
    ],
  };
}

export const listStorageSections = asyncHandler(async (req, res) => {
  const sections = await prisma.storageSection.findMany({
    where: storageWhere(req.query.search),
    orderBy: [{ zone: 'asc' }, { sectionCode: 'asc' }],
  });

  res.json({ status: 'success', sections: sections.map(toStorageDto) });
});

export const getStorageStats = asyncHandler(async (req, res) => {
  const sections = await prisma.storageSection.findMany();
  const totalCapacity = sections.reduce((sum, section) => sum + section.capacityUnits, 0);
  const occupied = sections.reduce((sum, section) => sum + section.occupiedUnits, 0);
  const available = Math.max(totalCapacity - occupied, 0);

  const zones = Object.values(sections.reduce((acc, section) => {
    if (!acc[section.zone]) {
      acc[section.zone] = { zone: section.zone, sections: 0, occupiedUnits: 0, capacityUnits: 0 };
    }
    acc[section.zone].sections += 1;
    acc[section.zone].occupiedUnits += section.occupiedUnits;
    acc[section.zone].capacityUnits += section.capacityUnits;
    return acc;
  }, {})).map((zone) => ({
    ...zone,
    utilization: utilizationPercent(zone.occupiedUnits, zone.capacityUnits),
    amountLabel: `${zone.occupiedUnits}/${zone.capacityUnits}`,
  }));

  res.json({
    status: 'success',
    stats: {
      totalCapacity,
      occupied,
      available,
      occupancyRate: utilizationPercent(occupied, totalCapacity),
      zones,
    },
  });
});

export const getStorageSection = asyncHandler(async (req, res) => {
  const section = await prisma.storageSection.findUnique({ where: { id: req.params.id } });
  if (!section) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Storage section not found.' });
  return res.json({ status: 'success', section: toStorageDto(section) });
});

export const createStorageSection = asyncHandler(async (req, res) => {
  const data = storagePayload(req.body);
  if (!data.sectionCode || !data.zone || !data.location || !data.capacityUnits) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Section code, zone, location, and capacity units are required.' });
  }

  try {
    const section = await prisma.storageSection.create({ data });
    return res.status(201).json({ status: 'success', message: 'Storage section created successfully.', section: toStorageDto(section) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'A storage section with this code already exists.' });
    }
    throw error;
  }
});

export const updateStorageSection = asyncHandler(async (req, res) => {
  const current = await prisma.storageSection.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Storage section not found.' });

  const data = storagePayload({ ...current, ...req.body });
  try {
    const section = await prisma.storageSection.update({ where: { id: req.params.id }, data });
    return res.json({ status: 'success', message: 'Storage section updated successfully.', section: toStorageDto(section) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'A storage section with this code already exists.' });
    }
    throw error;
  }
});

export const deleteStorageSection = asyncHandler(async (req, res) => {
  const current = await prisma.storageSection.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Storage section not found.' });

  await prisma.storageSection.delete({ where: { id: req.params.id } });
  return res.json({ status: 'success', message: 'Storage section deleted successfully.' });
});
