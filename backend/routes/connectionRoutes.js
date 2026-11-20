import express from "express";
import {
    sendConnectionRequest,
    getIncomingRequests,
    getSentRequests,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelSentRequest,
    getMyConnections,
    removeConnection
} from "../controllers/connectionController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All connection routes require authentication
router.use(authenticateToken);

// GET /api/connections/requests - Get incoming connection requests
router.get("/requests", getIncomingRequests);

// GET /api/connections/sent - Get sent connection requests
router.get("/sent", getSentRequests);

// GET /api/connections - Get accepted connections
router.get("/", getMyConnections);

// POST /api/connections/:userId - Send connection request
router.post("/:userId", sendConnectionRequest);

// PATCH /api/connections/:id/accept - Accept incoming request
router.patch("/:id/accept", acceptConnectionRequest);

// PATCH /api/connections/:id/reject - Reject incoming request
router.patch("/:id/reject", rejectConnectionRequest);

// DELETE /api/connections/:id - Cancel sent pending request
router.delete("/:id", cancelSentRequest);

// DELETE /api/connections/:id/remove - Remove an accepted connection
router.delete("/:id/remove", removeConnection);

export default router;
