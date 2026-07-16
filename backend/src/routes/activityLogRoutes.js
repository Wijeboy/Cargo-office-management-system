import express from 'express';
import * as activityCtrl from '../controllers/system/activityLog.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', activityCtrl.getActivityLogs);
router.post('/', authenticate, activityCtrl.createActivityLog);
router.get('/stats', activityCtrl.getActivityStats);

export default router;
