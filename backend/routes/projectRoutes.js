import express from 'express';
import {
  getAllProjects,
  getMyProjects,
  createProject,
  joinProject,
  leaveProject,
} from '../controllers/projectController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuthenticateToken, getAllProjects);
router.get('/mine', authenticateToken, getMyProjects);
router.post('/', authenticateToken, createProject);
router.post('/:id/join', authenticateToken, joinProject);
router.delete('/:id/leave', authenticateToken, leaveProject);

export default router;
