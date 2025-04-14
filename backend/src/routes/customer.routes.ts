import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
const customerController = new CustomerController();

// All customer routes are protected
router.use(protect);

// GET all customers - accessible by all authenticated users
router.get('/', customerController.getAllCustomers);

// GET customer by ID - accessible by all authenticated users
router.get('/:id', customerController.getCustomerById);

// GET customer projects - accessible by all authenticated users
router.get('/:id/projects', customerController.getCustomerProjects);

// GET customer sales - accessible by all authenticated users
router.get('/:id/sales', customerController.getCustomerSales);

// CREATE a new customer - accessible by admin and sales
router.post('/', restrictTo('admin', 'sales'), customerController.createCustomer);

// UPDATE a customer - accessible by admin and sales
router.put('/:id', restrictTo('admin', 'sales'), customerController.updateCustomer);

// DELETE a customer - admin only
router.delete('/:id', restrictTo('admin'), customerController.deleteCustomer);

export default router;
