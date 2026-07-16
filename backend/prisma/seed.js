import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
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
      senderName: 'Apex Manufacturing',
      senderContact: '+1 (555) 019-2834',
      senderAddress: '451 Industrial Parkway, Detroit, MI 48201',
      consigneeName: 'West Coast Distribution Center',
      consigneeContact: '+1 (555) 442-7890',
      consigneeAddress: '9200 Freight Way, Los Angeles, CA 90001',
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
      senderName: 'Global Freight Co.',
      senderContact: '+1 (555) 987-6543',
      senderAddress: '88 Maritime Blvd, Miami, FL 33101',
      consigneeName: 'Miami Regional Warehouse',
      consigneeContact: '+1 (555) 221-3345',
      consigneeAddress: '500 Port Access Road, Miami, FL 33122',
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

