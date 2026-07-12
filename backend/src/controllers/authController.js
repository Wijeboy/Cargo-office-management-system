import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

const prisma = new PrismaClient();

/**
 * Handle user registration (SignUp).
 */
export async function register(req, res) {
  const { name, email, password, role, department, phone, avatar } = req.body;

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
        avatar: avatar || null,
        status: true,
      },
    });

    // Generate token
    const token = generateToken(newUser);

    // Exclude password from response
    const { passwordHash, ...userWithoutPassword } = newUser;

    return res.status(211).json({
      status: 'success',
      message: 'User registered successfully.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to register user.',
      details: error.message,
    });
  }
}

/**
 * Handle user authentication (Login).
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Email and password are required fields.',
    });
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    if (!user.status) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Your account has been deactivated. Please contact your administrator.',
      });
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken(user);

    // Exclude password from response
    const { passwordHash, ...userWithoutPassword } = user;

    return res.json({
      status: 'success',
      message: 'Authentication successful.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Authentication failed.',
      details: error.message,
    });
  }
}

/**
 * Get current authenticated user profile.
 */
export async function getMe(req, res) {
  return res.json({
    status: 'success',
    user: req.user,
  });
}
