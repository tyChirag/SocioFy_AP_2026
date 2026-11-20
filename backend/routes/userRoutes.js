import express from "express";
import {
    getUsers,
    getFilterOptions,
    getUserProfile,
    getUserPosts,
    getUserConnections,
    getMe,
    updateProfile,
    uploadAvatar,
    removeAvatar
} from "../controllers/userController.js";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware.js";
import {
    avatarUpload,
    validateImageBuffer,
    handleUploadError
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// GET /api/users - Explore students with filters and search (optional auth to determine connection status)
router.get("/", optionalAuthenticateToken, getUsers);

// GET /api/users/filters - Available college and department filter options
router.get("/filters", getFilterOptions);

// GET /api/users/me - Fetch currently authenticated user profile
router.get("/me", authenticateToken, getMe);

// POST /api/users/me/avatar - Upload profile picture with validation
router.post(
    "/me/avatar",
    authenticateToken,
    avatarUpload.single("avatar"),
    handleUploadError,
    validateImageBuffer,
    uploadAvatar
);

// DELETE /api/users/me/avatar - Remove profile picture
router.delete("/me/avatar", authenticateToken, removeAvatar);

// PATCH /api/users/me - Update the logged-in student's own profile (protected)
router.patch("/me", authenticateToken, updateProfile);

// PUT /api/users/profile - Backward-compatible profile update (protected)
router.put("/profile", authenticateToken, updateProfile);

// GET /api/users/:id/posts - Fetch posts authored by student (paginated)
router.get("/:id/posts", optionalAuthenticateToken, getUserPosts);

// GET /api/users/:id/connections - Fetch accepted connections for student profile
router.get("/:id/connections", getUserConnections);

// GET /api/users/:id - View student profile by ID
router.get("/:id", optionalAuthenticateToken, getUserProfile);

export default router;
