import express from 'express';
import { register, login, getMe, updateProfile, changePassword, deactivateAccount, verify2FA } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/deactivate', authenticateToken, deactivateAccount);

export default router;
