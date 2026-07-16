import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ROLES
export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRole = async (req, res) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        permissions: { include: { permission: true } },
        users: { 
          include: { 
            user: { 
              select: { id: true, name: true, email: true, department: true } 
            } 
          } 
        },
      },
    });
    
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, slug, description, permissionIds } = req.body;
    
    const role = await prisma.role.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '_'),
        description,
        permissions: permissionIds ? {
          create: permissionIds.map(pid => ({ permissionId: parseInt(pid) })),
        } : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });
    
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;
    
    // Delete existing permissions
    await prisma.rolePermission.deleteMany({ where: { roleId: parseInt(id) } });
    
    // Update role
    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        permissions: permissionIds ? {
          create: permissionIds.map(pid => ({ permissionId: parseInt(pid) })),
        } : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });
    
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await prisma.role.findUnique({ 
      where: { id: parseInt(req.params.id) } 
    });
    
    if (role?.isSystem) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete system role' 
      });
    }
    
    await prisma.role.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PERMISSIONS
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
    
    // Group by resource
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {});
    
    res.json({ success: true, data: permissions, grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPermission = async (req, res) => {
  try {
    const { name, resource, action, description } = req.body;
    const permission = await prisma.permission.create({
      data: {
        name,
        slug: `${resource}.${action}`,
        resource,
        action,
        description,
      },
    });
    res.json({ success: true, data: permission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePermission = async (req, res) => {
  try {
    await prisma.permission.delete({ 
      where: { id: parseInt(req.params.id) } 
    });
    res.json({ success: true, message: 'Permission deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
