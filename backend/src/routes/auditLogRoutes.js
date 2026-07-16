import express from 'express';
import * as auditCtrl from '../controllers/system/auditLog.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auditCtrl.getAuditLogs);
router.post('/', authenticate, auditCtrl.createAuditLog);
router.get('/stats', auditCtrl.getAuditStats);

export default router;
