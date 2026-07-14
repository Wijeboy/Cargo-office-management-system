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
  // Clear existing records to avoid unique constraint violations
  await prisma.payment.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.customer.deleteMany({});
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

  // Seed Customers
  const custApex = await prisma.customer.create({
    data: {
      id: 'cust_apex',
      name: 'Apex Manufacturing',
      contactNo: '+1 (555) 019-2834',
      email: 'contact@apexmf.com',
      address: '451 Industrial Parkway, Detroit, MI 48201',
      company: 'Apex Manufacturing Ltd.',
    }
  });

  const custGlobal = await prisma.customer.create({
    data: {
      id: 'cust_global',
      name: 'Global Freight Co.',
      contactNo: '+1 (555) 987-6543',
      email: 'billing@globalfreight.com',
      address: '88 Maritime Blvd, Miami, FL 33101',
      company: 'Global Freight LLC',
    }
  });

  console.log('Created customers.');

  // Seed Shipments
  const shipApex = await prisma.shipment.create({
    data: {
      id: 'ship_apex_001',
      shipmentCode: 'LOG-2401',
      customerId: custApex.id,
      origin: 'Chicago, IL',
      destination: 'Los Angeles, CA',
      weight: 1250.0,
      description: 'Cross-Country Freight & Server Components',
      status: 'IN_TRANSIT',
      dispatchDate: new Date('2026-07-01T09:00:00Z'),
    }
  });

  const shipGlobal = await prisma.shipment.create({
    data: {
      id: 'ship_global_001',
      shipmentCode: 'LOG-2402',
      customerId: custGlobal.id,
      origin: 'New York, NY',
      destination: 'Miami, FL',
      weight: 820.0,
      description: 'Medical supplies and industrial equipment',
      status: 'DELIVERED',
      dispatchDate: new Date('2026-07-02T10:00:00Z'),
      deliveryDate: new Date('2026-07-05T14:30:00Z'),
    }
  });

  console.log('Created shipments.');

  // Seed Invoices
  // We'll store item details serialized as JSON in `notes` for Apex
  const apexNotes = JSON.stringify([
    {
      title: "Cross-Country Freight",
      details: "Chicago to Los Angeles - Logistics Route A-12",
      quantity: 2,
      rate: 8200.0,
      amount: 16400.0,
    },
    {
      title: "Terminal Handling Fees",
      details: "Processing and priority loading surcharge",
      quantity: 1,
      rate: 1200.0,
      amount: 1200.0,
    },
    {
      title: "Insurance Premium",
      details: "Comprehensive cargo protection plan",
      quantity: 1,
      rate: 800.0,
      amount: 800.0,
    }
  ]);

  await prisma.invoice.create({
    data: {
      id: 'inv_apex_001',
      invoiceNo: 'INV-1043',
      shipmentId: shipApex.id,
      customerId: custApex.id,
      totalAmount: 19763.00,
      tax: 1363.00,
      paymentStatus: 'PAID',
      paymentMethod: 'Bank Transfer',
      notes: apexNotes,
      date: new Date('2026-07-04T11:00:00Z'),
    }
  });

  await prisma.invoice.create({
    data: {
      id: 'inv_global_001',
      invoiceNo: 'INV-1041',
      shipmentId: shipGlobal.id,
      customerId: custGlobal.id,
      totalAmount: 9800.00,
      tax: 726.00,
      paymentStatus: 'PENDING',
      paymentMethod: null,
      notes: 'Standard 30-day term payment.',
      date: new Date('2026-07-05T14:00:00Z'),
    }
  });

  console.log('Created invoices.');

  // Seed Payments (against the PAID Apex invoice)
  await prisma.payment.create({
    data: {
      id: 'pay_apex_001',
      paymentNo: 'PAY-1001',
      invoiceId: 'inv_apex_001',
      amount: 19763.00,
      method: 'BANK_TRANSFER',
      status: 'COMPLETED',
      reference: 'TXN-88213422',
      notes: 'Full settlement received.',
      paidBy: 'Apex Manufacturing',
      paymentDate: new Date('2026-07-06T09:15:00Z'),
    }
  });

  // Partial payment against the PENDING Global Freight invoice
  await prisma.payment.create({
    data: {
      id: 'pay_global_001',
      paymentNo: 'PAY-1002',
      invoiceId: 'inv_global_001',
      amount: 4000.00,
      method: 'CREDIT_CARD',
      status: 'COMPLETED',
      reference: 'TXN-88213980',
      notes: 'Partial advance payment.',
      paidBy: 'Global Freight Co.',
      paymentDate: new Date('2026-07-07T13:40:00Z'),
    }
  });

  // Reflect the partial payment on the invoice's payment status
  await prisma.invoice.update({
    where: { id: 'inv_global_001' },
    data: { paymentStatus: 'PARTIALLY_PAID', paymentMethod: 'CREDIT_CARD' },
  });

  console.log('Created payments.');

  // Seed Expenses
  const sampleExpenses = [
    {
      id: 'exp_001',
      expenseNo: 'EXP-1001',
      category: 'FUEL',
      title: 'Fleet diesel refill',
      description: 'Fuel top-up for cross-country freight trucks.',
      amount: 3200.00,
      status: 'APPROVED',
      paymentMethod: 'BANK_TRANSFER',
      vendor: 'Shell Fleet Services',
      incurredBy: 'Operations Manager',
      expenseDate: new Date('2026-07-02T08:00:00Z'),
    },
    {
      id: 'exp_002',
      expenseNo: 'EXP-1002',
      category: 'MAINTENANCE',
      title: 'Warehouse forklift servicing',
      description: 'Routine maintenance for warehouse equipment.',
      amount: 850.00,
      status: 'APPROVED',
      paymentMethod: 'CASH',
      vendor: 'Toyota Material Handling',
      incurredBy: 'Warehouse Operator',
      expenseDate: new Date('2026-07-03T10:30:00Z'),
    },
    {
      id: 'exp_003',
      expenseNo: 'EXP-1003',
      category: 'OFFICE',
      title: 'Office supplies restock',
      description: 'Stationery and printer consumables.',
      amount: 240.50,
      status: 'PENDING',
      paymentMethod: null,
      vendor: 'Staples Inc.',
      incurredBy: 'Finance Executive',
      expenseDate: new Date('2026-07-06T15:00:00Z'),
    },
    {
      id: 'exp_004',
      expenseNo: 'EXP-1004',
      category: 'UTILITIES',
      title: 'Warehouse electricity bill',
      description: 'Monthly electricity charges for main warehouse.',
      amount: 1120.75,
      status: 'APPROVED',
      paymentMethod: 'BANK_TRANSFER',
      vendor: 'City Power & Light',
      incurredBy: 'Finance Executive',
      expenseDate: new Date('2026-07-08T09:00:00Z'),
    },
  ];

  for (const e of sampleExpenses) {
    await prisma.expense.create({ data: e });
  }

  console.log('Created expenses.');
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

