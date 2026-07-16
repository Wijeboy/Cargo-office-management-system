import express from 'express';
<<<<<<< HEAD
import { body } from 'express-validator';
import { login, refreshToken, logout, getCurrentUser, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

router.post('/login', loginValidation, validateRequest, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePasswordValidation, validateRequest, changePassword);

export default router;
=======
import { register, login, getMe, updateProfile, changePassword, deactivateAccount, verify2FA, requestForgotPassword, verifyResetCode, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/forgot-password', requestForgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/deactivate', authenticateToken, deactivateAccount);

export default router;
>>>>>>> 39e42b38ca42cfbf8821c79b252ff8c42727cdde
