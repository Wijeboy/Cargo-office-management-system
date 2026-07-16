import express from 'express';
import * as settingsCtrl from '../controllers/system/settings.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', settingsCtrl.getAllSettings);
router.get('/category/:category', settingsCtrl.getSettingsByCategory);
router.put('/:key', authenticate, settingsCtrl.updateSetting);
router.post('/bulk', authenticate, settingsCtrl.bulkUpdateSettings);

export default router;
