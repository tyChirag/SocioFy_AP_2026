import express from "express";
import { deleteComment } from "../controllers/commentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// DELETE /api/comments/:id - Delete a comment (authenticated user must be the author)
router.delete("/:id", authenticateToken, deleteComment);

export default router;
