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

    if (user.twoFA) {
      return res.json({
        status: '2fa_required',
        message: 'Two-factor authentication is required.',
        userId: user.id
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

/**
 * Update authenticated user profile.
 */
export async function updateProfile(req, res) {
  const userId = req.user.id;
  const { name, phone, timezone, bio, location, avatar, twoFA, prefSystemAlerts, prefWeeklyReport, prefBetaFeatures } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? phone : undefined,
        timezone: timezone !== undefined ? timezone : undefined,
        bio: bio !== undefined ? bio : undefined,
        location: location !== undefined ? location : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        twoFA: twoFA !== undefined ? twoFA : undefined,
        prefSystemAlerts: prefSystemAlerts !== undefined ? prefSystemAlerts : undefined,
        prefWeeklyReport: prefWeeklyReport !== undefined ? prefWeeklyReport : undefined,
        prefBetaFeatures: prefBetaFeatures !== undefined ? prefBetaFeatures : undefined,
      },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return res.json({
      status: 'success',
      message: 'Profile updated successfully.',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to update profile.',
      details: error.message,
    });
  }
}

/**
 * Change current user password.
 */
export async function changePassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Current password and new password are required fields.',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'User not found.',
      });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'The current password you entered is incorrect.',
      });
    }

    // Hash and save new password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return res.json({
      status: 'success',
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to change password.',
      details: error.message,
    });
  }
}

/**
 * Deactivate own account.
 */
export async function deactivateAccount(req, res) {
  const userId = req.user.id;

  try {
    // Prevent system admin from deactivating themselves to avoid lockout
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user && user.email === 'admin@logiflow.com') {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'The primary system admin account cannot be deactivated.',
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: false },
    });

    return res.json({
      status: 'success',
      message: 'Account deactivated successfully.',
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to deactivate account.',
      details: error.message,
    });
  }
}

/**
 * Verify 2FA code during login.
 */
export async function verify2FA(req, res) {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'User ID and verification code are required.',
    });
  }

  // Check demo code 123456
  if (code !== '123456') {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid two-factor verification code. Enter 123456 for demo.',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'User not found.',
      });
    }

    if (!user.status) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Your account has been deactivated.',
      });
    }

    // Generate token
    const token = generateToken(user);
    const { passwordHash, ...userWithoutPassword } = user;

    return res.json({
      status: 'success',
      message: 'Authentication successful.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to verify 2FA.',
      details: error.message,
    });
  }
}

