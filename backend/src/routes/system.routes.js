import express from 'express';
import * as settingsCtrl from '../controllers/system/settings.controller.js';
import * as configCtrl from '../controllers/system/appConfig.controller.js';
import * as auditCtrl from '../controllers/system/auditLog.controller.js';
import * as activityCtrl from '../controllers/system/activityLog.controller.js';
import * as roleCtrl from '../controllers/system/role.controller.js';

const router = express.Router();

// System Settings
router.get('/settings', settingsCtrl.getAllSettings);
router.get('/settings/category/:category', settingsCtrl.getSettingsByCategory);
router.put('/settings/:key', settingsCtrl.updateSetting);
router.post('/settings/bulk', settingsCtrl.bulkUpdateSettings);

// Application Config
router.get('/configs', configCtrl.getAllConfigs);
router.get('/configs/:key', configCtrl.getConfig);
router.put('/configs/:key', configCtrl.updateConfig);
router.delete('/configs/:key', configCtrl.deleteConfig);

// Audit Logs
router.get('/audit-logs', auditCtrl.getAuditLogs);
router.post('/audit-logs', auditCtrl.createAuditLog);
router.get('/audit-logs/stats', auditCtrl.getAuditStats);

// Activity Logs
router.get('/activity-logs', activityCtrl.getActivityLogs);
router.post('/activity-logs', activityCtrl.createActivityLog);
router.get('/activity-logs/stats', activityCtrl.getActivityStats);

// Roles
router.get('/roles', roleCtrl.getAllRoles);
router.get('/roles/:id', roleCtrl.getRole);
router.post('/roles', roleCtrl.createRole);
router.put('/roles/:id', roleCtrl.updateRole);
router.delete('/roles/:id', roleCtrl.deleteRole);

// Permissions
router.get('/permissions', roleCtrl.getAllPermissions);
router.post('/permissions', roleCtrl.createPermission);
router.delete('/permissions/:id', roleCtrl.deletePermission);

export default router;
