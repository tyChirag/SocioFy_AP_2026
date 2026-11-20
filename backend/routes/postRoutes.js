import express from "express";
import {
    createPost,
    getAllPosts,
    getPostById,
    likePost,
    unlikePost,
    getCommentsByPost,
    createComment
} from "../controllers/postController.js";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/posts - Fetch all posts (newest first, with optional user like resolution)
router.get("/", optionalAuthenticateToken, getAllPosts);

// POST /api/posts - Create a new post (protected)
router.post("/", authenticateToken, createPost);

// GET /api/posts/:id - Fetch single post by ID (for /post/:id route)
router.get("/:id", optionalAuthenticateToken, getPostById);

// POST /api/posts/:id/like - Like a post (protected)
router.post("/:id/like", authenticateToken, likePost);

// DELETE /api/posts/:id/like - Unlike a post (protected)
router.delete("/:id/like", authenticateToken, unlikePost);

// GET /api/posts/:id/comments - Fetch comments for a post (oldest first)
router.get("/:id/comments", optionalAuthenticateToken, getCommentsByPost);

// POST /api/posts/:id/comments - Create a comment on a post (protected)
router.post("/:id/comments", authenticateToken, createComment);

export default router;
