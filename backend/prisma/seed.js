import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data to avoid unique constraint violations
  // Payments/Expenses must be cleared BEFORE Invoices (foreign key)
  await prisma.payment.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.trackingEvent.deleteMany({});
  await prisma.warehouseItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.route.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultUsers = [
    { name: 'System Admin', email: 'admin@logiflow.com', password: 'admin123', role: 'ADMIN', department: 'Administration' },
    { name: 'Operations Manager', email: 'ops@logiflow.com', password: 'ops123', role: 'OPERATIONS', department: 'Operations' },
    { name: 'Finance Executive', email: 'finance@logiflow.com', password: 'finance123', role: 'FINANCE', department: 'Finance' },
    { name: 'Customer Support', email: 'cs@logiflow.com', password: 'cs123', role: 'CUSTOMER_SERVICE', department: 'Customer Service' },
    { name: 'Warehouse Operator', email: 'warehouse@logiflow.com', password: 'warehouse123', role: 'WAREHOUSE', department: 'Logistics' },
  ];

  for (const u of defaultUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: { name: u.name, email: u.email, passwordHash, role: u.role, department: u.department, status: true },
    });
    console.log(`Created user: ${user.email} (${user.role})`);
  }

  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'John Doe', contactNo: '+1 (555) 101-2001', email: 'john.doe@techcorp.com', address: '123 Market St, San Francisco, CA 94102', company: 'TechCorp Inc.' } }),
    prisma.customer.create({ data: { name: 'Bill Kent', contactNo: '+1 (555) 102-2002', email: 'bill.kent@globaltrade.com', address: '456 Commerce Blvd, Austin, TX 78701', company: 'Global Trade Co.' } }),
    prisma.customer.create({ data: { name: 'Linda Chen', contactNo: '+1 (555) 103-2003', email: 'linda.chen@oceanfreight.com', address: '789 Harbor Dr, Seattle, WA 98101', company: 'Ocean Freight LLC' } }),
    prisma.customer.create({ data: { name: 'Marcus Johnson', contactNo: '+1 (555) 104-2004', email: 'marcus@midwestlogistics.com', address: '321 Industrial Ave, Chicago, IL 60601', company: 'Midwest Logistics' } }),
    prisma.customer.create({ data: { name: 'Elena Vasquez', contactNo: '+1 (555) 105-2005', email: 'elena@sunshinecargo.com', address: '654 Sunshine Pkwy, Miami, FL 33101', company: 'Sunshine Cargo' } }),
  ]);

  const [route1, route2] = await Promise.all([
    prisma.route.create({ data: { routeId: 'US-W101', startHub: 'Oakland', endHub: 'Chicago', estimatedDays: 2.5 } }),
    prisma.route.create({ data: { routeId: 'US-W102', startHub: 'Chicago', endHub: 'JFK Airport', estimatedDays: 1.5 } }),
  ]);

  const [vehicle1, vehicle2] = await Promise.all([
    prisma.vehicle.create({ data: { vehicleId: 'T304', type: 'Heavy Truck', capacity: 22000, status: 'Available', description: 'Truck, Heavy Capacity (22,000 kg)' } }),
    prisma.vehicle.create({ data: { vehicleId: 'T310', type: 'Truck', capacity: 14000, status: 'In Use', description: 'Truck, Standard Capacity (14,000 kg)' } }),
  ]);

  const shipments = await Promise.all([
    prisma.shipment.create({ data: { shipmentCode: 'LOG-2401', customerId: customers[0].id, routeId: route1.id, vehicleId: vehicle1.id, senderName: 'John Doe', senderContact: '+1 (555) 101-2001', senderAddress: '123 Market St, San Francisco, CA 94102', consigneeName: 'Apex Manufacturing Solutions', consigneeContact: 'Sarah Chen', consigneeAddress: '45 Main Campus, San Francisco, CA', origin: 'Los Angeles, CA', destination: 'San Francisco, CA', weight: 250.5, description: 'Electronics - Server components', dimensions: '120 x 80 x 150', shippingMethod: 'Express Air', expectedDeliveryDate: new Date('2024-10-24T18:00:00Z'), status: 'IN_TRANSIT', dispatchDate: new Date('2024-10-20T06:00:00Z') } }),
    prisma.shipment.create({ data: { shipmentCode: 'LOG-2402', customerId: customers[3].id, routeId: route2.id, vehicleId: vehicle2.id, senderName: 'Marcus Johnson', senderContact: '+1 (555) 104-2004', senderAddress: '321 Industrial Ave, Chicago, IL 60601', consigneeName: 'Miami Distribution Center', consigneeContact: 'Ops Desk', consigneeAddress: '99 Port Lane, Miami, FL', origin: 'New York, NY', destination: 'Miami, FL', weight: 1200, description: 'Industrial machinery parts', dimensions: '250 x 140 x 130', shippingMethod: 'Road Freight', expectedDeliveryDate: new Date('2024-10-22T14:30:00Z'), status: 'DELIVERED', dispatchDate: new Date('2024-10-15T07:00:00Z'), deliveryDate: new Date('2024-10-22T14:30:00Z') } }),
    prisma.shipment.create({ data: { shipmentCode: 'LOG-2398', customerId: customers[1].id, routeId: route1.id, senderName: 'Bill Kent', senderContact: '+1 (555) 102-2002', senderAddress: '456 Commerce Blvd, Austin, TX 78701', consigneeName: 'Austin Depot', consigneeContact: 'Depot Desk', consigneeAddress: '1000 Freight Ave, Austin, TX', origin: 'Houston, TX', destination: 'Austin, TX', weight: 800.75, description: 'Automotive parts - Rush', dimensions: '180 x 120 x 110', shippingMethod: 'Road Freight', expectedDeliveryDate: new Date('2024-10-21T17:00:00Z'), status: 'DELAYED', dispatchDate: new Date('2024-10-19T05:00:00Z') } }),
    prisma.shipment.create({ data: { shipmentCode: 'LOG-2405', customerId: customers[2].id, routeId: route2.id, senderName: 'Linda Chen', senderContact: '+1 (555) 103-2003', senderAddress: '789 Harbor Dr, Seattle, WA 98101', consigneeName: 'Portland Medical Supply', consigneeContact: 'Receiving', consigneeAddress: '33 Commerce Way, Portland, OR', origin: 'Seattle, WA', destination: 'Portland, OR', weight: 450, description: 'Medical supplies', dimensions: '140 x 90 x 100', shippingMethod: 'Express Air', expectedDeliveryDate: new Date('2024-10-26T16:00:00Z'), status: 'IN_TRANSIT', dispatchDate: new Date('2024-10-22T08:00:00Z') } }),
    prisma.shipment.create({ data: { shipmentCode: 'LOG-2410', customerId: customers[4].id, senderName: 'Elena Vasquez', senderContact: '+1 (555) 105-2005', senderAddress: '654 Sunshine Pkwy, Miami, FL 33101', consigneeName: 'Detroit Fashion Hub', consigneeContact: 'Receiving', consigneeAddress: '777 Style Rd, Detroit, MI', origin: 'Chicago, IL', destination: 'Detroit, MI', weight: 320.25, description: 'Fashion merchandise', dimensions: '100 x 70 x 90', shippingMethod: 'Standard Ground', expectedDeliveryDate: new Date('2024-10-29T10:00:00Z'), status: 'PENDING' } }),
    prisma.shipment.create({ data: { shipmentCode: 'LOG-2395', customerId: customers[0].id, routeId: route1.id, vehicleId: vehicle2.id, senderName: 'John Doe', senderContact: '+1 (555) 101-2001', senderAddress: '123 Market St, San Francisco, CA 94102', consigneeName: 'Washington Logistics Center', consigneeContact: 'Receiving', consigneeAddress: '88 Terminal Dr, Washington, DC', origin: 'Boston, MA', destination: 'Washington, DC', weight: 175, description: 'Office furniture', dimensions: '160 x 120 x 100', shippingMethod: 'Road Freight', expectedDeliveryDate: new Date('2024-10-14T12:00:00Z'), status: 'DELIVERED', dispatchDate: new Date('2024-10-10T06:00:00Z'), deliveryDate: new Date('2024-10-14T12:00:00Z') } }),
  ]);

  await Promise.all([
    prisma.trackingEvent.createMany({
      data: [
        { shipmentId: shipments[0].id, location: 'Los Angeles, CA', status: 'PICKED_UP', description: 'Cargo picked up from sender' },
        { shipmentId: shipments[0].id, location: 'Los Angeles Hub', status: 'PROCESSING', description: 'Package processed at sorting facility' },
        { shipmentId: shipments[0].id, location: 'Fresno, CA', status: 'IN_TRANSIT', description: 'In transit — en route to destination' },
        { shipmentId: shipments[1].id, location: 'New York, NY', status: 'PICKED_UP', description: 'Cargo picked up from warehouse' },
        { shipmentId: shipments[1].id, location: 'Miami, FL', status: 'DELIVERED', description: 'Successfully delivered to recipient' },
        { shipmentId: shipments[2].id, location: 'Houston, TX', status: 'PICKED_UP', description: 'Cargo picked up' },
        { shipmentId: shipments[2].id, location: 'San Antonio, TX', status: 'DELAYED', description: 'Delay due to vehicle breakdown — rescheduled' },
      ],
    }),
    prisma.warehouseItem.createMany({
      data: [
        { shipmentId: shipments[0].id, warehouseLocation: 'Zone A - Rack 12', status: 'SAFE', barcodeQR: 'QR-LOG2401-WH' },
        { shipmentId: shipments[2].id, warehouseLocation: 'Zone B - Rack 03', status: 'SAFE', barcodeQR: 'QR-LOG2398-WH' },
        { shipmentId: shipments[3].id, warehouseLocation: 'Zone C - Rack 07', status: 'DAMAGED', barcodeQR: 'QR-LOG2405-WH' },
      ],
    }),
  ]);

  // Seed Invoices individually (not createMany) so we get IDs back for Payments
  const invoice1 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2024-001', shipmentId: shipments[0].id, customerId: customers[0].id, totalAmount: 1850, tax: 185, paymentStatus: 'PENDING' } });
  const invoice2 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2024-002', shipmentId: shipments[1].id, customerId: customers[3].id, totalAmount: 4200, tax: 420, paymentStatus: 'PAID', paymentMethod: 'Bank Transfer' } });
  const invoice3 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2024-003', shipmentId: shipments[2].id, customerId: customers[1].id, totalAmount: 2900, tax: 290, paymentStatus: 'OVERDUE' } });
  const invoice4 = await prisma.invoice.create({ data: { invoiceNo: 'INV-2024-004', shipmentId: shipments[5].id, customerId: customers[0].id, totalAmount: 980, tax: 98, paymentStatus: 'PAID', paymentMethod: 'Cash' } });

  console.log('Created invoices.');

  // Seed Payments against the PAID invoices
  await prisma.payment.create({
    data: {
      paymentNo: 'PAY-1001',
      invoiceId: invoice2.id,
      amount: 4200.00,
      method: 'BANK_TRANSFER',
      status: 'COMPLETED',
      reference: 'TXN-88213422',
      notes: 'Full settlement received.',
      paidBy: 'Marcus Johnson',
      paymentDate: new Date('2024-10-23T09:15:00Z'),
    }
  });

  await prisma.payment.create({
    data: {
      paymentNo: 'PAY-1002',
      invoiceId: invoice4.id,
      amount: 980.00,
      method: 'CASH',
      status: 'COMPLETED',
      reference: 'TXN-88213980',
      notes: 'Paid in full via cash.',
      paidBy: 'John Doe',
      paymentDate: new Date('2024-10-15T13:40:00Z'),
    }
  });

  // Partial payment against the PENDING invoice
  await prisma.payment.create({
    data: {
      paymentNo: 'PAY-1003',
      invoiceId: invoice1.id,
      amount: 900.00,
      method: 'CREDIT_CARD',
      status: 'COMPLETED',
      reference: 'TXN-88214001',
      notes: 'Partial advance payment.',
      paidBy: 'John Doe',
      paymentDate: new Date('2024-10-21T10:00:00Z'),
    }
  });
  await prisma.invoice.update({ where: { id: invoice1.id }, data: { paymentStatus: 'PARTIALLY_PAID' } });

  console.log('Created payments.');

  // Seed Expenses
  const sampleExpenses = [
    { expenseNo: 'EXP-1001', category: 'FUEL', title: 'Fleet diesel refill', description: 'Fuel top-up for cross-country freight trucks.', amount: 3200.00, status: 'APPROVED', paymentMethod: 'BANK_TRANSFER', vendor: 'Shell Fleet Services', incurredBy: 'Operations Manager', expenseDate: new Date('2024-10-16T08:00:00Z') },
    { expenseNo: 'EXP-1002', category: 'MAINTENANCE', title: 'Warehouse forklift servicing', description: 'Routine maintenance for warehouse equipment.', amount: 850.00, status: 'APPROVED', paymentMethod: 'CASH', vendor: 'Toyota Material Handling', incurredBy: 'Warehouse Operator', expenseDate: new Date('2024-10-17T10:30:00Z') },
    { expenseNo: 'EXP-1003', category: 'OFFICE', title: 'Office supplies restock', description: 'Stationery and printer consumables.', amount: 240.50, status: 'PENDING', paymentMethod: null, vendor: 'Staples Inc.', incurredBy: 'Finance Executive', expenseDate: new Date('2024-10-18T15:00:00Z') },
    { expenseNo: 'EXP-1004', category: 'UTILITIES', title: 'Warehouse electricity bill', description: 'Monthly electricity charges for main warehouse.', amount: 1120.75, status: 'APPROVED', paymentMethod: 'BANK_TRANSFER', vendor: 'City Power & Light', incurredBy: 'Finance Executive', expenseDate: new Date('2024-10-19T09:00:00Z') },
  ];

  for (const e of sampleExpenses) {
    await prisma.expense.create({ data: e });
  }

  console.log('Created expenses.');

  await prisma.shipment.update({
    where: { id: shipments[2].id },
    data: { archivedAt: new Date('2023-12-14T00:00:00Z') },
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