import express from 'express';
import * as configCtrl from '../controllers/system/appConfig.controller.js';

const router = express.Router();

router.get('/', configCtrl.getAllConfigs);
router.get('/:key', configCtrl.getConfig);
router.put('/:key', configCtrl.updateConfig);
router.delete('/:key', configCtrl.deleteConfig);

export default router;
