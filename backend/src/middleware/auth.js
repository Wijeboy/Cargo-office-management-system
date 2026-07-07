import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/auth.js';

const prisma = new PrismaClient();

/**
 * Middleware to authenticate requests using JWT.
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Access token is missing or invalid.',
    });
  }

  try {
    const decoded = verifyToken(token);
    
    // Get user from DB to verify status and role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'User no longer exists.',
      });
    }

    if (!user.status) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Your account has been deactivated.',
      });
    }

    // Attach user (without password hash) to request
    const { passwordHash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Invalid or expired token.',
      details: error.message,
    });
  }
}

/**
 * Middleware to restrict access based on user roles.
 * @param {string[]} roles 
 */
export function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}
