import { Router } from 'express';
import userRoutes from './user.routes';
import customerRoutes from './customer.routes';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import saleRoutes from './sale.routes';
import leadRoutes from './lead.routes';
import messageRoutes from './message.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running'
  });
});

// Database status route
router.get('/db-status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Database connection is active'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/projects', projectRoutes);
router.use('/sales', saleRoutes);
router.use('/leads', leadRoutes);
router.use('/messages', messageRoutes);

export default router;
