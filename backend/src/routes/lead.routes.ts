import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
const leadController = new LeadController();

// All lead routes are protected
router.use(protect);

// GET all leads - accessible by admin and sales
router.get('/', restrictTo('admin', 'sales'), leadController.getAllLeads);

// GET leads for the current user - accessible by all authenticated users
router.get('/my', leadController.getMyLeads);

// GET leads by assigned user - accessible by admin and sales
router.get('/user/:userId', restrictTo('admin', 'sales'), leadController.getLeadsByUser);

// GET lead by ID - accessible by all authenticated users
router.get('/:id', leadController.getLeadById);

// CREATE a new lead - accessible by admin and sales
router.post('/', restrictTo('admin', 'sales'), leadController.createLead);

// UPDATE a lead - accessible by admin and sales
router.put('/:id', restrictTo('admin', 'sales'), leadController.updateLead);

// UPDATE lead status - accessible by admin and sales
router.patch('/:id/status', restrictTo('admin', 'sales'), leadController.updateLeadStatus);

// CONVERT lead to customer - accessible by admin and sales
router.post('/:id/convert', restrictTo('admin', 'sales'), leadController.convertToCustomer);

// DELETE a lead - admin only
router.delete('/:id', restrictTo('admin'), leadController.deleteLead);

export default router;
