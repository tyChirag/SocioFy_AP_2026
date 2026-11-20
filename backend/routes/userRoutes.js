import express from "express";
import {
    getUsers,
    getFilterOptions,
    getUserProfile,
    updateProfile
} from "../controllers/userController.js";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/users - Explore students with filters and search (optional auth to determine connection status)
router.get("/", optionalAuthenticateToken, getUsers);

// GET /api/users/filters - Available college and department filter options
router.get("/filters", getFilterOptions);

// PUT /api/users/profile - Update the logged-in student's own profile (protected)
router.put("/profile", authenticateToken, updateProfile);

// GET /api/users/:id - View student profile by ID
router.get("/:id", optionalAuthenticateToken, getUserProfile);

export default router;
