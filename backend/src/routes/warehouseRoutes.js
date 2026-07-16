import express from 'express';
import { getWarehouseDashboard } from '../controllers/dashboardController.js';
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItem,
  getInventoryStats,
  listInventory,
  updateInventoryItem,
} from '../controllers/inventoryController.js';
import {
  createIncomingCargo,
  createOutgoingCargo,
  deleteIncomingCargo,
  deleteOutgoingCargo,
  getIncomingCargo,
  getIncomingCargoStats,
  getOutgoingCargo,
  getOutgoingCargoStats,
  listIncomingCargo,
  listOutgoingCargo,
  updateIncomingCargo,
  updateOutgoingCargo,
} from '../controllers/cargoController.js';
import {
  createStorageSection,
  deleteStorageSection,
  getStorageSection,
  getStorageStats,
  listStorageSections,
  updateStorageSection,
} from '../controllers/storageController.js';
import {
  createIncident,
  deleteIncident,
  getIncident,
  getIncidentStats,
  listIncidents,
  updateIncident,
} from '../controllers/incidentController.js';

const router = express.Router();

router.get('/dashboard', getWarehouseDashboard);

router.get('/inventory/stats', getInventoryStats);
router.get('/inventory', listInventory);
router.get('/inventory/:id', getInventoryItem);
router.post('/inventory', createInventoryItem);
router.put('/inventory/:id', updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);

router.get('/incoming/stats', getIncomingCargoStats);
router.get('/incoming', listIncomingCargo);
router.get('/incoming/:id', getIncomingCargo);
router.post('/incoming', createIncomingCargo);
router.put('/incoming/:id', updateIncomingCargo);
router.delete('/incoming/:id', deleteIncomingCargo);

router.get('/outgoing/stats', getOutgoingCargoStats);
router.get('/outgoing', listOutgoingCargo);
router.get('/outgoing/:id', getOutgoingCargo);
router.post('/outgoing', createOutgoingCargo);
router.put('/outgoing/:id', updateOutgoingCargo);
router.delete('/outgoing/:id', deleteOutgoingCargo);

router.get('/storage/stats', getStorageStats);
router.get('/storage', listStorageSections);
router.get('/storage/:id', getStorageSection);
router.post('/storage', createStorageSection);
router.put('/storage/:id', updateStorageSection);
router.delete('/storage/:id', deleteStorageSection);

router.get('/incidents/stats', getIncidentStats);
router.get('/incidents', listIncidents);
router.get('/incidents/:id', getIncident);
router.post('/incidents', createIncident);
router.put('/incidents/:id', updateIncident);
router.delete('/incidents/:id', deleteIncident);

export default router;
