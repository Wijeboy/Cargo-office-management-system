import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticate);

const createUserValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('username').notEmpty().trim().withMessage('Username is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('roleId').notEmpty().withMessage('Role is required'),
];

router.get('/', authorize('users.read'), getAllUsers);
router.get('/:id', authorize('users.read'), getUserById);
router.post('/', authorize('users.create'), createUserValidation, validateRequest, createUser);
router.put('/:id', authorize('users.update'), updateUser);
router.delete('/:id', authorize('users.delete'), deleteUser);
router.patch('/:id/toggle-status', authorize('users.update'), toggleUserStatus);

export default router;