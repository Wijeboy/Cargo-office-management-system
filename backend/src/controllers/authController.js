import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

const prisma = new PrismaClient();
const otpStore = new Map(); // Key: email, Value: { code, expiresAt }

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

    const hashedPassword = await hashPassword(password);

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

    const token = generateToken(newUser);
    const { passwordHash, ...userWithoutPassword } = newUser;

    return res.status(201).json({
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
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
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
        userId: user.id,
      });
    }

    const token = generateToken(user);
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
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { passwordHash, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Refresh JWT token.
 */
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.status) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { accessToken: newToken },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

/**
 * Logout.
 */
export const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
  const {
    name,
    phone,
    timezone,
    bio,
    location,
    avatar,
    twoFA,
    prefSystemAlerts,
    prefWeeklyReport,
    prefBetaFeatures,
  } = req.body;

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

    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'The current password you entered is incorrect.',
      });
    }

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

/**
 * Request forgot password OTP.
 */
export async function requestForgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Email address is required.',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'No account found with this email address.',
      });
    }

    if (!user.status) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Your account is deactivated.',
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    otpStore.set(email.toLowerCase(), { code, expiresAt });

    console.log(`[PASSWORD RESET OTP for ${email}]: ${code}`);

    return res.json({
      status: 'success',
      message: 'Verification code sent successfully. Enter demo code to reset password.',
      demoCode: code,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to request password reset.',
      details: error.message,
    });
  }
}

/**
 * Verify password reset OTP code.
 */
export async function verifyResetCode(req, res) {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Email address and verification code are required.',
    });
  }

  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'No active recovery request found. Try requesting again.',
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Verification code has expired. Please request a new one.',
    });
  }

  if (record.code !== code) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Invalid verification code.',
    });
  }

  return res.json({
    status: 'success',
    message: 'Verification code is valid.',
  });
}

/**
 * Reset password using valid OTP code.
 */
export async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Email, code, and new password are required fields.',
    });
  }

  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Recovery session not found.',
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Recovery session has expired.',
    });
  }

  if (record.code !== code) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Invalid code.',
    });
  }

  try {
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash: hashedPassword },
    });

    otpStore.delete(email.toLowerCase());

    return res.json({
      status: 'success',
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Password reset update error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to reset password.',
      details: error.message,
    });
  }
}


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

/**
 * Request forgot password OTP.
 */
export async function requestForgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Email address is required.',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'No account found with this email address.',
      });
    }

    if (!user.status) {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Your account is deactivated.',
      });
    }

    // Generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    otpStore.set(email.toLowerCase(), { code, expiresAt });

    console.log(`[PASSWORD RESET OTP for ${email}]: ${code}`);

    return res.json({
      status: 'success',
      message: 'Verification code sent successfully. Enter demo code to reset password.',
      demoCode: code, // returned for easier frontend manual evaluation
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to request password reset.',
      details: error.message,
    });
  }
}

/**
 * Verify password reset OTP code.
 */
export async function verifyResetCode(req, res) {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Email address and verification code are required.',
    });
  }

  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'No active recovery request found. Try requesting again.',
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Verification code has expired. Please request a new one.',
    });
  }

  if (record.code !== code) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Invalid verification code.',
    });
  }

  return res.json({
    status: 'success',
    message: 'Verification code is valid.',
  });
}

/**
 * Reset password using valid OTP code.
 */
export async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Email, code, and new password are required fields.',
    });
  }

  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Recovery session not found.',
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Recovery session has expired.',
    });
  }

  if (record.code !== code) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Invalid code.',
    });
  }

  try {
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash: hashedPassword },
    });

    // Clear session
    otpStore.delete(email.toLowerCase());

    return res.json({
      status: 'success',
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Password reset update error:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to reset password.',
      details: error.message,
    });
  }
}