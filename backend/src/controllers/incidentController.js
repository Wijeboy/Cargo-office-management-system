import { PrismaClient, Prisma } from '@prisma/client';
import { asyncHandler, formatDate, parseDate, parseInteger, parseNumber } from '../utils/warehouseFormatters.js';

const prisma = new PrismaClient();

function incidentPayload(body) {
  return {
    reportCode: body.reportCode || body.code,
    shipmentId: body.shipmentId,
    incidentType: body.incidentType,
    severity: body.severity,
    reportDate: parseDate(body.reportDate) || new Date(),
    location: body.location,
    itemDescription: body.itemDescription,
    quantityAffected: parseInteger(body.quantityAffected),
    estimatedValue: parseNumber(body.estimatedValue),
    description: body.description,
    reportedBy: body.reportedBy,
    status: body.status || 'Under Review',
    attachmentUrl: body.attachmentUrl || null,
  };
}

function toIncidentDto(report) {
  return {
    ...report,
    reportDateLabel: formatDate(report.reportDate),
    tableRow: [
      report.reportCode,
      report.severity,
      report.shipmentId,
      formatDate(report.reportDate),
      report.status,
    ],
  };
}

function incidentWhere(search) {
  if (!search) return {};
  return {
    OR: [
      { reportCode: { contains: search } },
      { shipmentId: { contains: search } },
      { incidentType: { contains: search } },
      { severity: { contains: search } },
      { status: { contains: search } },
      { reportedBy: { contains: search } },
    ],
  };
}

export const listIncidents = asyncHandler(async (req, res) => {
  const reports = await prisma.cargoIncident.findMany({
    where: incidentWhere(req.query.search),
    orderBy: { reportDate: 'desc' },
  });

  res.json({ status: 'success', reports: reports.map(toIncidentDto) });
});

export const getIncidentStats = asyncHandler(async (req, res) => {
  const reports = await prisma.cargoIncident.findMany();
  const stats = {
    totalReports: reports.length,
    underReview: reports.filter((report) => report.status === 'Under Review').length,
    resolved: reports.filter((report) => report.status === 'Resolved').length,
    totalValue: reports.reduce((sum, report) => sum + report.estimatedValue, 0),
  };

  res.json({ status: 'success', stats });
});

export const getIncident = asyncHandler(async (req, res) => {
  const report = await prisma.cargoIncident.findUnique({ where: { id: req.params.id } });
  if (!report) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Incident report not found.' });
  return res.json({ status: 'success', report: toIncidentDto(report) });
});

export const createIncident = asyncHandler(async (req, res) => {
  const data = incidentPayload(req.body);
  if (!data.reportCode || !data.shipmentId || !data.incidentType || !data.severity || !data.location || !data.itemDescription || !data.description || !data.reportedBy) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Report code, shipment ID, incident type, severity, location, item description, description, and reporter are required.' });
  }

  try {
    const report = await prisma.cargoIncident.create({ data });
    return res.status(201).json({ status: 'success', message: 'Incident report created successfully.', report: toIncidentDto(report) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'An incident report with this code already exists.' });
    }
    throw error;
  }
});

export const updateIncident = asyncHandler(async (req, res) => {
  const current = await prisma.cargoIncident.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Incident report not found.' });

  const data = incidentPayload({ ...current, ...req.body });
  try {
    const report = await prisma.cargoIncident.update({ where: { id: req.params.id }, data });
    return res.json({ status: 'success', message: 'Incident report updated successfully.', report: toIncidentDto(report) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'An incident report with this code already exists.' });
    }
    throw error;
  }
});

export const deleteIncident = asyncHandler(async (req, res) => {
  const current = await prisma.cargoIncident.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Incident report not found.' });

  await prisma.cargoIncident.delete({ where: { id: req.params.id } });
  return res.json({ status: 'success', message: 'Incident report deleted successfully.' });
});
