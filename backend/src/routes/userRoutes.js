import express from 'express';
<<<<<<< HEAD
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
=======
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin role requirements to all user management routes
router.use(authenticateToken);
router.use(requireRoles(['ADMIN']));

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
>>>>>>> 39e42b38ca42cfbf8821c79b252ff8c42727cdde
