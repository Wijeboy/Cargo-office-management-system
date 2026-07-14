import { PrismaClient, Prisma } from '@prisma/client';
import { asyncHandler, formatDate, formatWeight, inventoryStatus, parseInteger, parseNumber } from '../utils/warehouseFormatters.js';

const prisma = new PrismaClient();

function toInventoryPayload(body) {
  const quantity = parseInteger(body.quantity);
  const minStock = parseInteger(body.minStock, 10);

  return {
    itemCode: body.itemCode || body.code,
    name: body.name,
    category: body.category,
    quantity,
    location: body.location,
    weight: parseNumber(body.weight),
    weightUnit: body.weightUnit || 'kg',
    minStock,
    description: body.description || null,
    status: body.status || inventoryStatus(quantity, minStock),
  };
}

function toInventoryDto(item) {
  return {
    ...item,
    weightLabel: formatWeight(item.weight, item.weightUnit),
    lastUpdated: formatDate(item.updatedAt),
    tableRow: [
      item.itemCode,
      item.name,
      item.category,
      String(item.quantity),
      item.location,
      formatWeight(item.weight, item.weightUnit),
      item.status,
      formatDate(item.updatedAt),
    ],
  };
}

function inventoryWhere(search) {
  if (!search) return {};
  return {
    OR: [
      { itemCode: { contains: search } },
      { name: { contains: search } },
      { category: { contains: search } },
      { location: { contains: search } },
    ],
  };
}

export const listInventory = asyncHandler(async (req, res) => {
  const items = await prisma.inventoryItem.findMany({
    where: inventoryWhere(req.query.search),
    orderBy: { updatedAt: 'desc' },
  });

  res.json({
    status: 'success',
    items: items.map(toInventoryDto),
  });
});

export const getInventoryStats = asyncHandler(async (req, res) => {
  const items = await prisma.inventoryItem.findMany();
  const stats = items.reduce((acc, item) => {
    acc.totalItems += 1;
    acc.totalStockUnits += item.quantity;
    if (item.status === 'In Stock') acc.inStock += 1;
    if (item.status === 'Low Stock') acc.lowStock += 1;
    if (item.status === 'Out of Stock') acc.outOfStock += 1;
    return acc;
  }, { totalItems: 0, totalStockUnits: 0, inStock: 0, lowStock: 0, outOfStock: 0 });

  res.json({ status: 'success', stats });
});

export const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Inventory item not found.' });
  return res.json({ status: 'success', item: toInventoryDto(item) });
});

export const createInventoryItem = asyncHandler(async (req, res) => {
  const data = toInventoryPayload(req.body);
  if (!data.itemCode || !data.name || !data.category || !data.location) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Item code, name, category, and location are required.' });
  }

  try {
    const item = await prisma.inventoryItem.create({ data });
    return res.status(201).json({ status: 'success', message: 'Inventory item created successfully.', item: toInventoryDto(item) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'An inventory item with this code already exists.' });
    }
    throw error;
  }
});

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const current = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Inventory item not found.' });

  const merged = { ...current, ...req.body };
  const data = toInventoryPayload(merged);

  try {
    const item = await prisma.inventoryItem.update({ where: { id: req.params.id }, data });
    return res.json({ status: 'success', message: 'Inventory item updated successfully.', item: toInventoryDto(item) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'An inventory item with this code already exists.' });
    }
    throw error;
  }
});

export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const current = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Inventory item not found.' });

  await prisma.inventoryItem.delete({ where: { id: req.params.id } });
  return res.json({ status: 'success', message: 'Inventory item deleted successfully.' });
});
