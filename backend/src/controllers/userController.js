import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth.js';

const prisma = new PrismaClient();

/**
 * Get all users in the system.
 */
export async function getAllUsers(req, res) {
  try {
    const { search } = req.query;
    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { role: { contains: search } },
          { department: { contains: search } },
        ],
      } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Exclude password hashes from the list
    const safeUsers = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return res.json({
      status: 'success',
      users: safeUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve users.',
      details: error.message,
    });
  }
}

/**
 * Get user management dashboard statistics.
 */
export async function getUserStats(req, res) {
  try {
    const users = await prisma.user.findMany();
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.status).length,
      inactiveUsers: users.filter(user => !user.status).length,
      suspendedUsers: users.filter(user => String(user.role).toUpperCase() === 'SUSPENDED').length,
      byRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
    };

    return res.json({
      status: 'success',
      stats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve user stats.',
      details: error.message,
    });
  }
}

/**
 * Get a single user by ID.
 */
export async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'User not found.',
      });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return res.json({
      status: 'success',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to retrieve user.',
      details: error.message,
    });
  }
}

/**
 * Create a new user (Admin action).
 */
export async function createUser(req, res) {
  const { name, email, password, role, department, phone, status } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Name, email, and password are required fields.',
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 409,
        error: 'Conflict',
        message: 'A user with this email address already exists.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role: role || 'OPERATIONS',
        department: department || null,
        phone: phone || null,
        status: status !== undefined ? status : true,
      },
    });

    // Exclude password from response
    const { passwordHash, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      status: 'success',
      message: 'User created successfully.',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to create user.',
      details: error.message,
    });
  }
}

/**
 * Update an existing user.
 */
export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, password, role, department, phone, status } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'User not found.',
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;

    if (email !== undefined && email.toLowerCase() !== user.email) {
      // Check if new email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(409).json({
          status: 409,
          error: 'Conflict',
          message: 'Email address is already in use.',
        });
      }
      updateData.email = email.toLowerCase();
    }

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return res.json({
      status: 'success',
      message: 'User updated successfully.',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update user.',
      details: error.message,
    });
  }
}

/**
 * Delete a user.
 */
export async function deleteUser(req, res) {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'User not found.',
      });
    }

    // Prevent Admin from deleting themselves
    if (req.user && req.user.id === id) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'You cannot delete your own admin account.',
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.json({
      status: 'success',
      message: 'User deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to delete user.',
      details: error.message,
    });
  }
}
