import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  await prisma.cargoIncident.deleteMany({});
  await prisma.storageSection.deleteMany({});
  await prisma.outgoingCargo.deleteMany({});
  await prisma.incomingCargo.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.user.deleteMany({});
  
  const defaultUsers = [
    {
      name: 'System Admin',
      email: 'admin@logiflow.com',
      password: 'admin123',
      role: 'ADMIN',
      department: 'Administration',
    },
    {
      name: 'Operations Manager',
      email: 'ops@logiflow.com',
      password: 'ops123',
      role: 'OPERATIONS',
      department: 'Operations',
    },
    {
      name: 'Finance Executive',
      email: 'finance@logiflow.com',
      password: 'finance123',
      role: 'FINANCE',
      department: 'Finance',
    },
    {
      name: 'Customer Support',
      email: 'cs@logiflow.com',
      password: 'cs123',
      role: 'CUSTOMER_SERVICE',
      department: 'Customer Service',
    },
    {
      name: 'Warehouse Operator',
      email: 'warehouse@logiflow.com',
      password: 'warehouse123',
      role: 'WAREHOUSE',
      department: 'Logistics',
    },
  ];

  for (const u of defaultUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        department: u.department,
        status: true,
      },
    });
    console.log(`Created user: ${user.email} (${user.role})`);
  }

  await prisma.inventoryItem.createMany({
    data: [
      { itemCode: 'INV-001', name: 'Machine Parts XYZ-7', category: 'Machinery', quantity: 245, location: 'Warehouse A-12', weight: 1240, minStock: 25, status: 'In Stock' },
      { itemCode: 'INV-002', name: 'Electronic Components', category: 'Electronics', quantity: 128, location: 'Warehouse B-05', weight: 320, minStock: 30, status: 'In Stock' },
      { itemCode: 'INV-003', name: 'Textile Materials', category: 'Textiles', quantity: 45, location: 'Warehouse C-18', weight: 890, minStock: 50, status: 'Low Stock' },
      { itemCode: 'INV-004', name: 'Automotive Parts', category: 'Automotive', quantity: 0, location: 'Warehouse A-08', weight: 2100, minStock: 20, status: 'Out of Stock' },
      { itemCode: 'INV-005', name: 'Medical Equipment', category: 'Healthcare', quantity: 67, location: 'Warehouse D-03', weight: 540, minStock: 15, status: 'In Stock' },
      { itemCode: 'INV-006', name: 'Food & Beverages', category: 'F&B', quantity: 312, location: 'Warehouse E-22', weight: 1850, minStock: 60, status: 'In Stock' },
    ],
  });

  await prisma.incomingCargo.createMany({
    data: [
      { cargoCode: 'INC-001', senderCompany: 'Acme Logistics Inc.', origin: 'Los Angeles, CA', itemName: 'Machine Parts XYZ-7', quantity: 245, weight: 1240, progress: 65, status: 'In Transit', expectedArrival: new Date('2026-07-18') },
      { cargoCode: 'INC-002', senderCompany: 'Global Exports Ltd.', origin: 'New York, NY', itemName: 'Electronic Components', quantity: 128, weight: 320, progress: 85, status: 'Arriving Soon', expectedArrival: new Date('2026-07-16') },
      { cargoCode: 'INC-003', senderCompany: 'Pacific Freight Co.', origin: 'Seattle, WA', itemName: 'Textile Materials', quantity: 45, weight: 890, progress: 35, status: 'Delayed', expectedArrival: new Date('2026-07-20') },
      { cargoCode: 'INC-004', senderCompany: 'MedCare Supplies', origin: 'Boston, MA', itemName: 'Medical Equipment', quantity: 67, weight: 540, progress: 55, status: 'In Transit', expectedArrival: new Date('2026-07-19') },
    ],
  });

  await prisma.outgoingCargo.createMany({
    data: [
      { shipmentCode: 'OUT-001', consignee: 'Apex Manufacturing Solutions', destination: 'San Francisco, CA', itemName: 'Machine Parts XYZ-7', quantity: 245, weight: 1240, shipDate: new Date('2026-07-14'), status: 'Dispatched', trackingId: 'TRK-7832451' },
      { shipmentCode: 'OUT-002', consignee: 'Tech Innovations Inc.', destination: 'Austin, TX', itemName: 'Electronic Components', quantity: 128, weight: 320, shipDate: new Date('2026-07-15'), status: 'Pending Pickup', trackingId: 'TRK-7832452' },
      { shipmentCode: 'OUT-003', consignee: 'Global Fashion Co.', destination: 'New York, NY', itemName: 'Textile Materials', quantity: 45, weight: 890, shipDate: new Date('2026-07-13'), status: 'In Transit', trackingId: 'TRK-7832453' },
      { shipmentCode: 'OUT-004', consignee: 'Auto Parts Direct', destination: 'Detroit, MI', itemName: 'Automotive Parts', quantity: 40, weight: 2100, shipDate: new Date('2026-07-16'), status: 'Processing', trackingId: 'TRK-7832454' },
      { shipmentCode: 'OUT-005', consignee: 'MedCare Supplies', destination: 'Boston, MA', itemName: 'Medical Equipment', quantity: 67, weight: 540, shipDate: new Date('2026-07-14'), status: 'Delivered', trackingId: 'TRK-7832455' },
      { shipmentCode: 'OUT-006', consignee: 'Fresh Market Foods', destination: 'Portland, OR', itemName: 'Food & Beverages', quantity: 312, weight: 1850, shipDate: new Date('2026-07-17'), status: 'Pending Pickup', trackingId: 'TRK-7832456' },
    ],
  });

  await prisma.storageSection.createMany({
    data: [
      { sectionCode: 'A-01', zone: 'Zone A', location: 'Row 1, Bay 1', currentItems: 'Machine Parts', occupiedUnits: 42, capacityUnits: 50, status: 'Occupied' },
      { sectionCode: 'A-02', zone: 'Zone A', location: 'Row 1, Bay 2', currentItems: null, occupiedUnits: 0, capacityUnits: 50, status: 'Available' },
      { sectionCode: 'A-03', zone: 'Zone A', location: 'Row 1, Bay 3', currentItems: 'Electronics', occupiedUnits: 48, capacityUnits: 50, status: 'Occupied' },
      { sectionCode: 'B-01', zone: 'Zone B', location: 'Row 2, Bay 1', currentItems: 'Textiles', occupiedUnits: 32, capacityUnits: 45, status: 'Occupied' },
      { sectionCode: 'B-02', zone: 'Zone B', location: 'Row 2, Bay 2', currentItems: null, occupiedUnits: 0, capacityUnits: 45, status: 'Available' },
      { sectionCode: 'C-01', zone: 'Zone C', location: 'Row 3, Bay 1', currentItems: 'Medical Equipment', occupiedUnits: 38, capacityUnits: 40, status: 'Occupied' },
    ],
  });

  await prisma.cargoIncident.createMany({
    data: [
      { reportCode: 'DMG-001', shipmentId: 'LOG-2401', incidentType: 'Damage', severity: 'Minor', reportDate: new Date('2026-07-14'), location: 'Warehouse A-12', itemDescription: 'Machine Parts XYZ-7', quantityAffected: 3, estimatedValue: 850, description: 'Small scratches found on outer casing during receiving inspection.', reportedBy: 'Warehouse Operator', status: 'Under Review' },
      { reportCode: 'DMG-002', shipmentId: 'LOG-2398', incidentType: 'Lost', severity: 'Critical', reportDate: new Date('2026-07-12'), location: 'Transit Hub 2', itemDescription: 'Electronic Components', quantityAffected: 12, estimatedValue: 5200, description: 'Carton missing after transfer scan reconciliation.', reportedBy: 'Operations Manager', status: 'Investigating' },
      { reportCode: 'DMG-003', shipmentId: 'LOG-2405', incidentType: 'Damage', severity: 'Major', reportDate: new Date('2026-07-13'), location: 'Warehouse C-18', itemDescription: 'Textile Materials', quantityAffected: 8, estimatedValue: 1300, description: 'Water exposure detected on multiple packages.', reportedBy: 'Warehouse Operator', status: 'Resolved' },
      { reportCode: 'DMG-004', shipmentId: 'LOG-2412', incidentType: 'Damage', severity: 'Minor', reportDate: new Date('2026-07-14'), location: 'Warehouse D-03', itemDescription: 'Medical Equipment', quantityAffected: 1, estimatedValue: 2200, description: 'One crate seal broken during unloading.', reportedBy: 'Quality Control', status: 'Under Review' },
    ],
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
