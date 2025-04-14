import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
const projectController = new ProjectController();

// All project routes are protected
router.use(protect);

// GET all projects - accessible by all authenticated users
router.get('/', projectController.getAllProjects);

// GET project by ID - accessible by all authenticated users
router.get('/:id', projectController.getProjectById);

// GET projects by customer - accessible by all authenticated users
router.get('/customer/:customerId', projectController.getProjectsByCustomer);

// GET projects by manager - accessible by all authenticated users
router.get('/manager/:managerId', projectController.getProjectsByManager);

// CREATE a new project - accessible by admin and sales
router.post('/', restrictTo('admin', 'sales'), projectController.createProject);

// UPDATE a project - accessible by admin, sales, and project_manager
router.put('/:id', restrictTo('admin', 'sales', 'project_manager'), projectController.updateProject);

// ASSIGN team to a project - accessible by admin and project_manager
router.patch('/:id/team', restrictTo('admin', 'project_manager'), projectController.assignTeam);

// DELETE a project - admin only
router.delete('/:id', restrictTo('admin'), projectController.deleteProject);

export default router;
