import express from "express";
import { deleteMessage } from "../controllers/messageController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// DELETE /api/messages/:id - Delete student's own message
router.delete("/:id", authenticateToken, deleteMessage);

export default router;
