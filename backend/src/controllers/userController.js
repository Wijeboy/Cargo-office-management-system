import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendSuccess, sendError } from '../utils/response.js';

const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search, roleId, isActive } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { username: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }
    if (roleId) where.roleId = roleId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, username: true, firstName: true, lastName: true,
        phone: true, isActive: true, role: { select: { id: true, name: true } },
      },
    });
    return sendSuccess(res, 'Users retrieved successfully', users);
  } catch (error) {
    console.error('Get users error:', error);
    return sendError(res, 'Failed to retrieve users');
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, username: true, firstName: true, lastName: true,
        phone: true, isActive: true,
        role: { select: { id: true, name: true, description: true } },
      },
    });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'User retrieved successfully', user);
  } catch (error) {
    console.error('Get user error:', error);
    return sendError(res, 'Failed to retrieve user');
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, phone, roleId } = req.body;
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) return sendError(res, 'User with this email or username already exists', 400);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword, firstName, lastName, phone, roleId },
      select: {
        id: true, email: true, username: true, firstName: true, lastName: true,
        phone: true, isActive: true, role: { select: { id: true, name: true } },
      },
    });
    return sendSuccess(res, 'User created successfully', user, 201);
  } catch (error) {
    console.error('Create user error:', error);
    return sendError(res, 'Failed to create user');
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, roleId, isActive } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'User not found', 404);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone !== undefined ? phone : user.phone,
        roleId: roleId || user.roleId,
        isActive: isActive !== undefined ? isActive : user.isActive,
      },
      select: {
        id: true, email: true, username: true, firstName: true, lastName: true,
        phone: true, isActive: true, role: { select: { id: true, name: true } },
      },
    });
    return sendSuccess(res, 'User updated successfully', updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return sendError(res, 'Failed to update user');
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return sendError(res, 'Cannot delete your own account', 400);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'User not found', 404);
    await prisma.user.delete({ where: { id } });
    return sendSuccess(res, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return sendError(res, 'Failed to delete user');
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'User not found', 404);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    return sendSuccess(res, 'User status updated successfully', { 
      id: updatedUser.id, isActive: updatedUser.isActive 
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    return sendError(res, 'Failed to update user status');
  }
};
