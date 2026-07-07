import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing users to avoid unique constraint violations
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
