import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response.js';

const prisma = new PrismaClient();

export const getAllPermissions = async (req, res) => {
  try {
    const { resource, grouped } = req.query;
    const where = {};
    if (resource) where.resource = resource;

    const permissions = await prisma.permission.findMany({
      where,
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    if (grouped === 'true') {
      const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push({
          id: perm.id,
          name: perm.name,
          action: perm.action,
          description: perm.description,
        });
        return acc;
      }, {});
      return sendSuccess(res, 'Permissions retrieved successfully', groupedPermissions);
    }

    return sendSuccess(res, 'Permissions retrieved successfully', permissions);
  } catch (error) {
    return sendError(res, 'Failed to retrieve permissions');
  }
};

export const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: { roles: { include: { role: { select: { id: true, name: true } } } } },
    });

    if (!permission) {
      return sendError(res, 'Permission not found', 404);
    }

    return sendSuccess(res, 'Permission retrieved successfully', permission);
  } catch (error) {
    return sendError(res, 'Failed to retrieve permission');
  }
};

export const getResources = async (req, res) => {
  try {
    const resources = await prisma.permission.findMany({
      distinct: ['resource'],
      select: { resource: true },
      orderBy: { resource: 'asc' },
    });

    const resourceList = resources.map(r => r.resource);
    return sendSuccess(res, 'Resources retrieved successfully', resourceList);
  } catch (error) {
    return sendError(res, 'Failed to retrieve resources');
  }
};
