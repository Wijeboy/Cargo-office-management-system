import express from 'express';
import {
  getShipments,
  getShipmentById,
  createBooking,
  updateShipment,
  deleteShipment,
  getTrackingByCode,
  addTrackingEvent,
  getRoutes,
  createRoute,
  updateRoute,
  getVehicles,
  createVehicle,
  updateVehicle,
  getSchedulingDashboard,
  assignShipment,
  getOperationsReport,
  getShipmentHistory,
} from '../controllers/cargoController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Public tracking endpoint for customer-facing pages.
router.get('/tracking/:shipmentCode', getTrackingByCode);

// Protect all other cargo operations.
router.use(authenticateToken);

router.get('/bookings', getShipments);
router.get('/bookings/:id', getShipmentById);
router.post('/bookings', requireRoles(['ADMIN', 'OPERATIONS']), createBooking);
router.put('/bookings/:id', requireRoles(['ADMIN', 'OPERATIONS']), updateShipment);
router.delete('/bookings/:id', requireRoles(['ADMIN']), deleteShipment);
router.post('/bookings/:id/tracking-events', requireRoles(['ADMIN', 'OPERATIONS']), addTrackingEvent);

router.get('/scheduling', requireRoles(['ADMIN', 'OPERATIONS', 'WAREHOUSE']), getSchedulingDashboard);
router.post('/scheduling/:shipmentId/assign', requireRoles(['ADMIN', 'OPERATIONS', 'WAREHOUSE']), assignShipment);

router.get('/routes', requireRoles(['ADMIN', 'OPERATIONS', 'WAREHOUSE']), getRoutes);
router.post('/routes', requireRoles(['ADMIN', 'OPERATIONS']), createRoute);
router.put('/routes/:id', requireRoles(['ADMIN', 'OPERATIONS']), updateRoute);

router.get('/vehicles', requireRoles(['ADMIN', 'OPERATIONS', 'WAREHOUSE']), getVehicles);
router.post('/vehicles', requireRoles(['ADMIN', 'OPERATIONS']), createVehicle);
router.put('/vehicles/:id', requireRoles(['ADMIN', 'OPERATIONS']), updateVehicle);

router.get('/reports/operations', requireRoles(['ADMIN', 'OPERATIONS']), getOperationsReport);
router.get('/history', requireRoles(['ADMIN', 'OPERATIONS', 'WAREHOUSE', 'CUSTOMER_SERVICE']), getShipmentHistory);

export default router;
