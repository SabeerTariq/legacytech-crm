import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// All user routes are protected
router.use(protect);

// GET all users - accessible by all authenticated users
router.get('/', userController.getAllUsers);

// GET user by ID - accessible by all authenticated users
router.get('/:id', userController.getUserById);

// Routes below are restricted to admin only
router.use(restrictTo('admin'));

// CREATE a new user - admin only
router.post('/', userController.createUser);

// UPDATE a user - admin only
router.put('/:id', userController.updateUser);

// DELETE a user - admin only
router.delete('/:id', userController.deleteUser);

export default router;
