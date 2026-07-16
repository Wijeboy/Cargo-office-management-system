import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  console.log('🌱 Seeding...');
  const perms = [
    { name: 'View Users', resource: 'users', action: 'read' },
    { name: 'Manage Roles', resource: 'roles', action: 'manage' },
  ];
  for (const p of perms) {
    await prisma.permission.upsert({ where: { slug: `${p.resource}.${p.action}` }, update: {}, create: { ...p, slug: `${p.resource}.${p.action}` } });
  }
  const adminRole = await prisma.role.upsert({ where: { slug: 'admin' }, update: {}, create: { name: 'Admin', slug: 'admin', isSystem: true } });
  const hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({ where: { email: 'admin@logiflow.com' }, update: {}, create: { name: 'Admin', email: 'admin@logiflow.com', passwordHash: hash, role: 'ADMIN', status: true } });
  await prisma.systemSetting.upsert({ where: { key: 'app_name' }, update: {}, create: { category: 'general', key: 'app_name', value: 'LogiFlow', type: 'string' } });
  console.log('✅ Done! Login: admin@logiflow.com / admin123');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
