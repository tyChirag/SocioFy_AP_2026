import express from "express";
import {
    createOrGetConversation,
    getMyConversations,
    getConversationById,
    getConversationMessages,
    sendMessage,
    markConversationRead
} from "../controllers/conversationController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All conversation routes require valid student authentication
router.use(authenticateToken);

// POST /api/conversations - Create or get 1-to-1 conversation with an accepted connection
router.post("/", createOrGetConversation);

// GET /api/conversations - Get all conversations for current user with previews & unread counts
router.get("/", getMyConversations);

// GET /api/conversations/:id - Get conversation details & participants
router.get("/:id", getConversationById);

// GET /api/conversations/:id/messages - Fetch paginated chronological messages for a conversation
router.get("/:id/messages", getConversationMessages);

// POST /api/conversations/:id/messages - Send a new message in conversation
router.post("/:id/messages", sendMessage);

// PATCH /api/conversations/:id/read - Mark messages as read by recipient
router.patch("/:id/read", markConversationRead);

export default router;
