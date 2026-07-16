import express from 'express';
import * as roleCtrl from '../controllers/system/role.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', roleCtrl.getAllPermissions);
router.post('/', authenticate, roleCtrl.createPermission);
router.delete('/:id', authenticate, roleCtrl.deletePermission);

export default router;
