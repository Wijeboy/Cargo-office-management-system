import express from 'express';

import {
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  registerCustomer,
  updateCustomer,
} from '../controllers/customerController.js';

const router = express.Router();

// Customer registration
router.post('/register', registerCustomer);

// Customer management CRUD
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;