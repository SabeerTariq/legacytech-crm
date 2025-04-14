import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);

export default router;
