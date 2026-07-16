export function parseNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseInteger(value, fallback = 0) {
  return Math.trunc(parseNumber(value, fallback));
}

export function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(date) {
  if (!date) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatWeight(weight, unit = 'kg') {
  return `${Number(weight || 0).toLocaleString('en-US')} ${unit}`;
}

export function inventoryStatus(quantity, minStock = 10) {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= minStock) return 'Low Stock';
  return 'In Stock';
}

export function storageStatus(occupiedUnits, capacityUnits) {
  if (occupiedUnits <= 0) return 'Available';
  if (occupiedUnits >= capacityUnits) return 'Full';
  return 'Occupied';
}

export function utilizationPercent(occupiedUnits, capacityUnits) {
  if (!capacityUnits) return 0;
  return Math.round((occupiedUnits / capacityUnits) * 1000) / 10;
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
