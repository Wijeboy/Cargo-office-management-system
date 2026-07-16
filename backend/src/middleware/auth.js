<<<<<<< HEAD
﻿import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
=======
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
>>>>>>> 39e42b38ca42cfbf8821c79b252ff8c42727cdde
      });
    }

    next();
  };
<<<<<<< HEAD
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    }
    next();
  } catch (error) {
    next();
  }
};
=======
}
>>>>>>> 39e42b38ca42cfbf8821c79b252ff8c42727cdde
