import express from 'express';
import {
  getAllCommunities,
  getMyCommunities,
  joinCommunity,
  leaveCommunity,
} from '../controllers/communityController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuthenticateToken, getAllCommunities);
router.get('/mine', authenticateToken, getMyCommunities);
router.post('/:id/join', authenticateToken, joinCommunity);
router.delete('/:id/leave', authenticateToken, leaveCommunity);

export default router;
