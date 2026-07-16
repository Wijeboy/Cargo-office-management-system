import express from 'express';
import { getAllUsers, getUserById, getUserStats, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin role requirements to all user management routes
router.use(authenticateToken);
router.use(requireRoles(['ADMIN']));

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
