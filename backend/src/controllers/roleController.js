import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

const prisma = new PrismaClient();

export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      isActive: role.isActive,
      userCount: role._count.users,
      permissionCount: role.permissions.length,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return sendSuccess(res, 'Roles retrieved successfully', formattedRoles);
  } catch (error) {
    return sendError(res, 'Failed to retrieve roles');
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        users: { select: { id: true, username: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!role) {
      return sendError(res, 'Role not found', 404);
    }

    return sendSuccess(res, 'Role retrieved successfully', role);
  } catch (error) {
    return sendError(res, 'Failed to retrieve role');
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, description, isActive, permissionIds } = req.body;
    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      return sendError(res, 'Role with this name already exists', 400);
    }

    const role = await prisma.role.create({
      data: { name, description, isActive: isActive !== undefined ? isActive : true, isSystem: false },
    });

    if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
      await Promise.all(
        permissionIds.map(permissionId =>
          prisma.rolePermission.create({ data: { roleId: role.id, permissionId } })
        )
      );
    }

    const createdRole = await prisma.role.findUnique({
      where: { id: role.id },
      include: { permissions: { include: { permission: true } } },
    });

    return sendSuccess(res, 'Role created successfully', createdRole, 201);
  } catch (error) {
    return sendError(res, 'Failed to create role');
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, permissionIds } = req.body;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return sendError(res, 'Role not found', 404);
    }

    if (role.isSystem) {
      return sendError(res, 'System roles cannot be modified', 403);
    }

    await prisma.role.update({
      where: { id },
      data: {
        name: name || role.name,
        description: description !== undefined ? description : role.description,
        isActive: isActive !== undefined ? isActive : role.isActive,
      },
    });

    if (permissionIds && Array.isArray(permissionIds)) {
      await prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (permissionIds.length > 0) {
        await Promise.all(
          permissionIds.map(permissionId =>
            prisma.rolePermission.create({ data: { roleId: id, permissionId } })
          )
        );
      }
    }

    const updatedRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });

    return sendSuccess(res, 'Role updated successfully', updatedRole);
  } catch (error) {
    return sendError(res, 'Failed to update role');
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      return sendError(res, 'Role not found', 404);
    }

    if (role.isSystem) {
      return sendError(res, 'System roles cannot be deleted', 403);
    }

    if (role._count.users > 0) {
      return sendError(res, 'Cannot delete role with assigned users', 400);
    }

    await prisma.role.delete({ where: { id } });
    return sendSuccess(res, 'Role deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete role');
  }
};

export const assignPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return sendError(res, 'permissionIds must be an array', 400);
    }

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return sendError(res, 'Role not found', 404);
    }

    await prisma.rolePermission.deleteMany({ where: { roleId: id } });

    if (permissionIds.length > 0) {
      await Promise.all(
        permissionIds.map(permissionId =>
          prisma.rolePermission.create({ data: { roleId: id, permissionId } })
        )
      );
    }

    const updatedRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });

    return sendSuccess(res, 'Permissions assigned successfully', updatedRole);
  } catch (error) {
    console.error('Assign permissions error:', error);
    return sendError(res, 'Failed to assign permissions');
  }
};
