import express from 'express';
import * as roleCtrl from '../controllers/system/role.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', roleCtrl.getAllRoles);
router.get('/:id', roleCtrl.getRole);
router.post('/', authenticate, roleCtrl.createRole);
router.put('/:id', authenticate, roleCtrl.updateRole);
router.delete('/:id', authenticate, roleCtrl.deleteRole);

export default router;
