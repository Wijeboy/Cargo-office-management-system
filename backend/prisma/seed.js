import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {

  console.log(' Starting database seeding...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.applicationConfig.deleteMany();

  // Create Permissions
  const permissions = [
    // User Management
    { name: 'users.create', resource: 'users', action: 'create', description: 'Create new users' },
    { name: 'users.read', resource: 'users', action: 'read', description: 'View users' },
    { name: 'users.update', resource: 'users', action: 'update', description: 'Update users' },
    { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
    
    // Role Management
    { name: 'roles.create', resource: 'roles', action: 'create', description: 'Create roles' },
    { name: 'roles.read', resource: 'roles', action: 'read', description: 'View roles' },
    { name: 'roles.update', resource: 'roles', action: 'update', description: 'Update roles' },
    { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
    
    // Settings Management
    { name: 'settings.read', resource: 'settings', action: 'read', description: 'View settings' },
    { name: 'settings.update', resource: 'settings', action: 'update', description: 'Update settings' },
    
    // Inventory Management
    { name: 'inventory.create', resource: 'inventory', action: 'create', description: 'Create inventory items' },
    { name: 'inventory.read', resource: 'inventory', action: 'read', description: 'View inventory' },
    { name: 'inventory.update', resource: 'inventory', action: 'update', description: 'Update inventory' },
    { name: 'inventory.delete', resource: 'inventory', action: 'delete', description: 'Delete inventory' },
    
    // Audit Logs
    { name: 'audit.read', resource: 'audit', action: 'read', description: 'View audit logs' },
    
    // Dashboard
    { name: 'dashboard.read', resource: 'dashboard', action: 'read', description: 'View dashboard' },
  ];

  console.log('Creating permissions...');
  for (const perm of permissions) {
    await prisma.permission.create({ data: perm });
  }
  console.log(` Created ${permissions.length} permissions`);

  // Create Roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'Administrator',
      description: 'Full system access',
      isSystem: true,
    },
  });

  const opsRole = await prisma.role.create({
    data: {
      name: 'Operations Staff',
      description: 'Operations management',
      isSystem: true,
    },
  });

  const financeRole = await prisma.role.create({
    data: {
      name: 'Finance Staff',
      description: 'Financial operations',
      isSystem: true,
    },
  });

  const csRole = await prisma.role.create({
    data: {
      name: 'Customer Service',
      description: 'Customer support',
      isSystem: true,
    },
  });

  const warehouseRole = await prisma.role.create({
    data: {
      name: 'Warehouse Operator',
      description: 'Warehouse operations',
      isSystem: false,
    },
  });
  console.log(' Created 5 roles');

  // Assign all permissions to Admin
  console.log('Assigning permissions to roles...');
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign limited permissions to other roles
  const readPermissions = allPermissions.filter(p => p.action === 'read');
  
  for (const role of [opsRole, financeRole, csRole, warehouseRole]) {
    for (const permission of readPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log(' Assigned permissions to roles');

  // Create Users
  console.log('Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@logiflow.com',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1 (555) 000-0001',
      isActive: true,
      emailVerified: true,
      roleId: adminRole.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'ops@logiflow.com',
      username: 'ops',
      password: await bcrypt.hash('ops123', 10),
      firstName: 'Operations',
      lastName: 'Staff',
      phone: '+1 (555) 000-0002',
      isActive: true,
      emailVerified: true,
      roleId: opsRole.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'finance@logiflow.com',
      username: 'finance',
      password: await bcrypt.hash('finance123', 10),
      firstName: 'Finance',
      lastName: 'Staff',
      phone: '+1 (555) 000-0003',
      isActive: true,
      emailVerified: true,
      roleId: financeRole.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'cs@logiflow.com',
      username: 'cs',
      password: await bcrypt.hash('cs123', 10),
      firstName: 'Customer',
      lastName: 'Service',
      phone: '+1 (555) 000-0004',
      isActive: true,
      emailVerified: true,
      roleId: csRole.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'warehouse@logiflow.com',
      username: 'warehouse',
      password: await bcrypt.hash('warehouse123', 10),
      firstName: 'Warehouse',
      lastName: 'Operator',
      phone: '+1 (555) 000-0005',
      isActive: true,
      emailVerified: true,
      roleId: warehouseRole.id,
    },
  });
  console.log(' Created 5 users');

  // Create System Settings
  console.log('Creating system settings...');
  const systemSettings = [
    // General Settings
    {
      category: 'general',
      key: 'system_name',
      value: 'LogiFlow Cargo Management',
      dataType: 'string',
      label: 'System Name',
      description: 'Name displayed throughout the application',
      isPublic: true,
      displayOrder: 1,
    },
    {
      category: 'general',
      key: 'company_name',
      value: 'LogiFlow Systems Inc.',
      dataType: 'string',
      label: 'Company Name',
      description: 'Official organization name',
      isPublic: true,
      displayOrder: 2,
    },
    {
      category: 'general',
      key: 'contact_email',
      value: 'support@logiflow.com',
      dataType: 'string',
      label: 'Contact Email',
      description: 'Primary email for system notifications',
      isPublic: true,
      displayOrder: 3,
    },
    {
      category: 'general',
      key: 'support_phone',
      value: '+1 (555) 123-4567',
      dataType: 'string',
      label: 'Support Phone',
      description: 'Customer support contact number',
      isPublic: true,
      displayOrder: 4,
    },
    {
      category: 'general',
      key: 'date_format',
      value: 'MM/DD/YYYY',
      dataType: 'string',
      label: 'Date Format',
      description: 'Preferred date display format',
      isPublic: false,
      displayOrder: 5,
    },
    
    // Notification Settings
    {
      category: 'notifications',
      key: 'email_notifications',
      value: 'true',
      dataType: 'boolean',
      label: 'Email Notifications',
      description: 'Enable email notifications',
      isPublic: false,
      displayOrder: 1,
    },
    {
      category: 'notifications',
      key: 'sms_notifications',
      value: 'false',
      dataType: 'boolean',
      label: 'SMS Notifications',
      description: 'Enable SMS notifications',
      isPublic: false,
      displayOrder: 2,
    },
    {
      category: 'notifications',
      key: 'shipment_updates',
      value: 'true',
      dataType: 'boolean',
      label: 'Shipment Updates',
      description: 'Notify users when shipment statuses change',
      isPublic: false,
      displayOrder: 3,
    },
    {
      category: 'notifications',
      key: 'inventory_alerts',
      value: 'true',
      dataType: 'boolean',
      label: 'Inventory Alerts',
      description: 'Alert when stock levels become low',
      isPublic: false,
      displayOrder: 4,
    },
    {
      category: 'notifications',
      key: 'system_maintenance',
      value: 'true',
      dataType: 'boolean',
      label: 'System Maintenance',
      description: 'Notifications about maintenance schedules',
      isPublic: false,
      displayOrder: 5,
    },
    
    // Security Settings
    {
      category: 'security',
      key: 'session_timeout',
      value: '3600',
      dataType: 'number',
      label: 'Session Timeout (seconds)',
      description: 'Auto logout after inactivity',
      isPublic: false,
      displayOrder: 1,
    },
    {
      category: 'security',
      key: 'password_min_length',
      value: '8',
      dataType: 'number',
      label: 'Minimum Password Length',
      description: 'Minimum characters required for passwords',
      isPublic: false,
      displayOrder: 2,
    },
    {
      category: 'security',
      key: 'two_factor_auth',
      value: 'false',
      dataType: 'boolean',
      label: 'Two-Factor Authentication',
      description: 'Enable 2FA for all users',
      isPublic: false,
      displayOrder: 3,
    },
    
    // Database Settings
    {
      category: 'database',
      key: 'auto_backup',
      value: 'true',
      dataType: 'boolean',
      label: 'Automatic Backup',
      description: 'Enable automatic database backups',
      isPublic: false,
      displayOrder: 1,
    },
    {
      category: 'database',
      key: 'backup_frequency',
      value: 'daily',
      dataType: 'string',
      label: 'Backup Frequency',
      description: 'How often to backup database',
      isPublic: false,
      displayOrder: 2,
    },
    {
      category: 'database',
      key: 'retention_period',
      value: '30',
      dataType: 'number',
      label: 'Retention Period (days)',
      description: 'How long to keep backups',
      isPublic: false,
      displayOrder: 3,
    },
    
    // Email Settings
    {
      category: 'email',
      key: 'smtp_host',
      value: 'smtp.gmail.com',
      dataType: 'string',
      label: 'SMTP Host',
      description: 'SMTP server host',
      isPublic: false,
      displayOrder: 1,
    },
    {
      category: 'email',
      key: 'smtp_port',
      value: '587',
      dataType: 'number',
      label: 'SMTP Port',
      description: 'SMTP server port',
      isPublic: false,
      displayOrder: 2,
    },
    {
      category: 'email',
      key: 'smtp_secure',
      value: 'true',
      dataType: 'boolean',
      label: 'Enable SSL/TLS',
      description: 'Use secure connection',
      isPublic: false,
      displayOrder: 3,
    },
    
    // Localization Settings
    {
      category: 'localization',
      key: 'default_language',
      value: 'en-US',
      dataType: 'string',
      label: 'Default Language',
      description: 'System default language',
      isPublic: false,
      displayOrder: 1,
    },
    {
      category: 'localization',
      key: 'timezone',
      value: 'UTC-05:00',
      dataType: 'string',
      label: 'Timezone',
      description: 'System timezone',
      isPublic: false,
      displayOrder: 2,
    },
    {
      category: 'localization',
      key: 'currency',
      value: 'USD',
      dataType: 'string',
      label: 'Currency',
      description: 'Default currency',
      isPublic: false,
      displayOrder: 3,
    },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.create({ data: setting });
  }
  console.log(` Created ${systemSettings.length} system settings`);

  // Create sample audit log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SETUP',
      resource: 'system',
      resourceId: 'init',
      newValue: JSON.stringify({ message: 'System initialized with seed data' }),
      status: 'success',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('\n Database seeding completed!');
  console.log('\n Default Users:');
  console.log('   Admin: admin@logiflow.com / admin123');
  console.log('   Operations: ops@logiflow.com / ops123');
  console.log('   Finance: finance@logiflow.com / finance123');
  console.log('   Customer Service: cs@logiflow.com / cs123');
  console.log('   Warehouse: warehouse@logiflow.com / warehouse123');
  console.log('\n');

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

    console.error(' Error seeding database:', e);

    console.error(e);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
 
  });

