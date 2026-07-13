import express from 'express';
import { getCustomerDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/customer/:customerId', getCustomerDashboard);

export default router;