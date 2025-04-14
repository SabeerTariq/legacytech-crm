import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
const saleController = new SaleController();

// All sale routes are protected
router.use(protect);

// GET all sales - accessible by admin and sales
router.get('/', restrictTo('admin', 'sales'), saleController.getAllSales);

// GET sales for the current user - accessible by all authenticated users
router.get('/my-sales', saleController.getMySales);

// GET sales by customer - accessible by admin and sales
router.get('/customer/:customerId', restrictTo('admin', 'sales'), saleController.getSalesByCustomer);

// GET sales by seller - accessible by admin and sales
router.get('/seller/:sellerId', restrictTo('admin', 'sales'), saleController.getSalesBySeller);

// GET sale by ID - accessible by admin and sales
router.get('/:id', restrictTo('admin', 'sales'), saleController.getSaleById);

// CREATE a new sale - accessible by admin and sales
router.post('/', restrictTo('admin', 'sales'), saleController.createSale);

// UPDATE a sale - accessible by admin and sales
router.put('/:id', restrictTo('admin', 'sales'), saleController.updateSale);

// DELETE a sale - admin only
router.delete('/:id', restrictTo('admin'), saleController.deleteSale);

export default router;
