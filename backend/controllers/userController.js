import prisma from "../prisma.js";
import { uploadAvatarBuffer, deleteAvatar } from "../utils/cloudinary.js";

/**
 * GET /api/users
 * Search and explore students across all colleges.
 * Supports: search, college, department, academicYear, page, limit.
 * Excludes the logged-in student.
 */
export const getUsers = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        const {
            search = "",
            college = "",
            department = "",
            academicYear = "",
            page = 1,
            limit = 12
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
        const skip = (pageNum - 1) * limitNum;

        // Build filtering criteria
        const whereConditions = [];

        // 1. Exclude the logged-in student from their own Explore results
        if (currentUserId) {
            whereConditions.push({ id: { not: currentUserId } });
        }

        // 2. Search query matching full name, college, department, academic year, interests, skills
        const trimmedSearch = search.trim();
        if (trimmedSearch) {
            whereConditions.push({
                OR: [
                    { fullName: { contains: trimmedSearch, mode: "insensitive" } },
                    { collegeName: { contains: trimmedSearch, mode: "insensitive" } },
                    { department: { contains: trimmedSearch, mode: "insensitive" } },
                    { academicYear: { contains: trimmedSearch, mode: "insensitive" } },
                    { interests: { contains: trimmedSearch, mode: "insensitive" } },
                    { skills: { contains: trimmedSearch, mode: "insensitive" } }
                ]
            });
        }

        // 3. College filter (across all registered colleges)
        if (college.trim()) {
            whereConditions.push({
                collegeName: { contains: college.trim(), mode: "insensitive" }
            });
        }

        // 4. Department filter
        if (department.trim()) {
            whereConditions.push({
                department: { contains: department.trim(), mode: "insensitive" }
            });
        }

        // 5. Academic Year filter
        if (academicYear.trim()) {
            whereConditions.push({
                academicYear: { contains: academicYear.trim(), mode: "insensitive" }
            });
        }

        const whereClause = whereConditions.length > 0 ? { AND: whereConditions } : {};

        // Get total count for pagination
        const total = await prisma.user.count({ where: whereClause });

        // Fetch students matching filters with public fields ONLY
        const users = await prisma.user.findMany({
            where: whereClause,
            skip,
            take: limitNum,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fullName: true,
                collegeName: true,
                department: true,
                academicYear: true,
                bio: true,
                profileImage: true,
                skills: true,
                interests: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolioUrl: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        // Resolve connection relationship for the logged-in user
        let userConnectionsMap = new Map();
        if (currentUserId && users.length > 0) {
            const userIds = users.map((u) => u.id);
            const activeConnections = await prisma.connection.findMany({
                where: {
                    OR: [
                        { senderId: currentUserId, receiverId: { in: userIds } },
                        { senderId: { in: userIds }, receiverId: currentUserId }
                    ]
                }
            });

            for (const conn of activeConnections) {
                const otherUserId = conn.senderId === currentUserId ? conn.receiverId : conn.senderId;
                userConnectionsMap.set(otherUserId, conn);
            }
        }

        // Attach relationship status to each student
        const formattedUsers = users.map((user) => {
            let connectionStatus = "NONE";
            let connectionId = null;

            if (userConnectionsMap.has(user.id)) {
                const conn = userConnectionsMap.get(user.id);
                connectionId = conn.id;

                if (conn.status === "ACCEPTED") {
                    connectionStatus = "CONNECTED";
                } else if (conn.status === "PENDING") {
                    connectionStatus = conn.senderId === currentUserId ? "SENT" : "RECEIVED";
                } else if (conn.status === "REJECTED") {
                    connectionStatus = "REJECTED";
                }
            }

            return {
                ...user,
                connectionStatus,
                connectionId,
                postsCount: user._count.posts
            };
        });

        return res.status(200).json({
            success: true,
            users: formattedUsers,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1
            }
        });
    } catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch students. Please try again later."
        });
    }
};

/**
 * GET /api/users/filters
 * Returns unique colleges, departments, and academic years present in the database.
 */
export const getFilterOptions = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                collegeName: true,
                department: true,
                academicYear: true
            }
        });

        const colleges = [...new Set(users.map((u) => u.collegeName).filter(Boolean))].sort();
        const departments = [...new Set(users.map((u) => u.department).filter(Boolean))].sort();
        const academicYears = [...new Set(users.map((u) => u.academicYear).filter(Boolean))].sort();

        return res.status(200).json({
            success: true,
            colleges,
            departments,
            academicYears
        });
    } catch (error) {
        console.error("Get filter options error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load filter options."
        });
    }
};

/**
 * GET /api/users/:id
 * Fetch individual student profile by ID.
 * Returns public fields, connection counts, recent posts, and connection status.
 */
export const getUserProfile = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id, 10);
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (isNaN(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        // Fetch user with public fields only (never expose passwords, hashes, or private tokens)
        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                fullName: true,
                collegeName: true,
                department: true,
                academicYear: true,
                bio: true,
                profileImage: true,
                skills: true,
                interests: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolioUrl: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found."
            });
        }

        // Count accepted connections for this student
        const connectionsCount = await prisma.connection.count({
            where: {
                status: "ACCEPTED",
                OR: [{ senderId: targetUserId }, { receiverId: targetUserId }]
            }
        });

        // Fetch recent public posts
        const recentPosts = await prisma.post.findMany({
            where: { authorId: targetUserId },
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                content: true,
                createdAt: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        // Determine connection relationship relative to the viewer
        let connectionInfo = {
            status: "NONE",
            connectionId: null,
            isSelf: currentUserId === targetUserId
        };

        if (currentUserId && currentUserId !== targetUserId) {
            const conn = await prisma.connection.findFirst({
                where: {
                    OR: [
                        { senderId: currentUserId, receiverId: targetUserId },
                        { senderId: targetUserId, receiverId: currentUserId }
                    ]
                }
            });

            if (conn) {
                if (conn.status === "ACCEPTED") {
                    connectionInfo.status = "CONNECTED";
                    connectionInfo.connectionId = conn.id;
                } else if (conn.status === "PENDING") {
                    connectionInfo.status = conn.senderId === currentUserId ? "SENT" : "RECEIVED";
                    connectionInfo.connectionId = conn.id;
                } else if (conn.status === "REJECTED") {
                    connectionInfo.status = "REJECTED";
                    connectionInfo.connectionId = conn.id;
                }
            }
        }

        return res.status(200).json({
            success: true,
            user: {
                ...user,
                postsCount: user._count.posts,
                connectionsCount,
                recentPosts: recentPosts.map((p) => ({
                    ...p,
                    likesCount: p._count.likes,
                    commentsCount: p._count.comments
                })),
                connection: connectionInfo
            }
        });
    } catch (error) {
        console.error("Get user profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load student profile."
        });
    }
};

/**
 * GET /api/users/me
 * Fetch the authenticated user's own profile fresh from database.
 */
export const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                collegeEmail: true,
                collegeName: true,
                department: true,
                academicYear: true,
                bio: true,
                profileImage: true,
                skills: true,
                interests: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolioUrl: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                ...user,
                postsCount: user._count.posts
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch current user profile."
        });
    }
};

/**
 * PUT /api/users/profile or PATCH /api/users/me
 * Update the logged-in student's own profile.
 * Allowed editable fields: fullName, bio, skills, interests, linkedinUrl, githubUrl, profileImage.
 * Protected: cannot edit another student's profile.
 * Never modifies private fields: password, collegeEmail, termsAccepted, isVerified.
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to update profile."
            });
        }

        const {
            fullName,
            bio,
            skills,
            interests,
            linkedinUrl,
            githubUrl,
            portfolioUrl,
            profileImage
        } = req.body;

        // Build sanitized update object with only allowed profile fields
        const updateData = {};

        if (fullName !== undefined && typeof fullName === "string" && fullName.trim()) {
            updateData.fullName = fullName.trim().slice(0, 100);
        }
        if (bio !== undefined) updateData.bio = typeof bio === "string" ? bio.trim().slice(0, 500) : null;
        if (skills !== undefined) updateData.skills = typeof skills === "string" ? skills.trim().slice(0, 300) : null;
        if (interests !== undefined) updateData.interests = typeof interests === "string" ? interests.trim().slice(0, 300) : null;
        if (linkedinUrl !== undefined) updateData.linkedinUrl = typeof linkedinUrl === "string" ? linkedinUrl.trim().slice(0, 200) : null;
        if (githubUrl !== undefined) updateData.githubUrl = typeof githubUrl === "string" ? githubUrl.trim().slice(0, 200) : null;
        if (portfolioUrl !== undefined) updateData.portfolioUrl = typeof portfolioUrl === "string" ? portfolioUrl.trim().slice(0, 200) : null;
        if (profileImage !== undefined) updateData.profileImage = typeof profileImage === "string" ? profileImage.trim() : null;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                collegeEmail: true,
                collegeName: true,
                department: true,
                academicYear: true,
                bio: true,
                profileImage: true,
                skills: true,
                interests: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolioUrl: true,
                createdAt: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile. Please try again."
        });
    }
};

/**
 * GET /api/users/:id/posts
 * Fetch all posts authored by a specific student with pagination and like status.
 */
export const getUserPosts = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id, 10);
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (isNaN(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        // Verify student exists
        const userExists = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true }
        });

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found."
            });
        }

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const skip = (page - 1) * limit;

        const total = await prisma.post.count({
            where: { authorId: targetUserId }
        });

        const posts = await prisma.post.findMany({
            where: { authorId: targetUserId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        collegeName: true,
                        department: true,
                        academicYear: true,
                        profileImage: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                likes: currentUserId
                    ? {
                          where: { userId: currentUserId },
                          select: { id: true }
                      }
                    : false
            }
        });

        const formattedPosts = posts.map((post) => {
            const hasLiked = currentUserId ? (Boolean(post.likes) && post.likes.length > 0) : false;
            const { likes, ...rest } = post;
            return {
                ...rest,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
                isLiked: hasLiked,
                isLikedByCurrentUser: hasLiked
            };
        });

        return res.status(200).json({
            success: true,
            posts: formattedPosts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            }
        });
    } catch (error) {
        console.error("Get user posts error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load posts for this student."
        });
    }
};

/**
 * POST /api/users/me/avatar
 * Upload or replace student profile picture with Cloudinary storage (and safe local fallback).
 * Accepts multipart/form-data with "avatar" file field.
 */
export const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to upload profile picture."
            });
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "Please select an image file to upload."
            });
        }

        // Fetch current user to inspect existing avatar
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, profileImagePublicId: true }
        });

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Upload new image buffer to Cloudinary (or local storage fallback)
        const uploadResult = await uploadAvatarBuffer(
            req.file.buffer,
            req.file.mimetype,
            userId
        );

        // Update database with the new profile picture URL and public ID
        let updatedUser;
        try {
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    profileImage: uploadResult.url,
                    profileImagePublicId: uploadResult.publicId
                },
                select: {
                    id: true,
                    fullName: true,
                    collegeEmail: true,
                    collegeName: true,
                    department: true,
                    academicYear: true,
                    bio: true,
                    profileImage: true,
                    skills: true,
                    interests: true,
                    linkedinUrl: true,
                    githubUrl: true,
                    portfolioUrl: true,
                    createdAt: true
                }
            });
        } catch (dbError) {
            // Clean up newly uploaded image if database update fails
            console.error("DB update failed after upload, rolling back image:", dbError);
            await deleteAvatar(uploadResult.publicId);
            throw dbError;
        }

        // If user already had a previous avatar, clean it up from storage
        if (currentUser.profileImagePublicId && currentUser.profileImagePublicId !== uploadResult.publicId) {
            await deleteAvatar(currentUser.profileImagePublicId);
        }

        return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully.",
            profileImage: updatedUser.profileImage,
            user: updatedUser
        });
    } catch (error) {
        console.error("Upload avatar error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to upload profile picture. Please try again."
        });
    }
};

/**
 * DELETE /api/users/me/avatar
 * Remove student profile picture from storage and database.
 */
export const removeAvatar = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, profileImagePublicId: true }
        });

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Remove from storage if publicId exists
        if (currentUser.profileImagePublicId) {
            await deleteAvatar(currentUser.profileImagePublicId);
        }

        // Reset database record
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                profileImage: null,
                profileImagePublicId: null
            },
            select: {
                id: true,
                fullName: true,
                collegeEmail: true,
                collegeName: true,
                department: true,
                academicYear: true,
                bio: true,
                profileImage: true,
                skills: true,
                interests: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolioUrl: true,
                createdAt: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Profile picture removed successfully.",
            user: updatedUser
        });
    } catch (error) {
        console.error("Remove avatar error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove profile picture."
        });
    }
};

/**
 * GET /api/users/:id/connections
 * Fetch accepted connections for a specific student profile.
 */
export const getUserConnections = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id, 10);

        if (isNaN(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        const connections = await prisma.connection.findMany({
            where: {
                status: "ACCEPTED",
                OR: [{ senderId: targetUserId }, { receiverId: targetUserId }]
            },
            orderBy: { updatedAt: "desc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        collegeName: true,
                        department: true,
                        academicYear: true,
                        bio: true,
                        profileImage: true,
                        skills: true,
                        interests: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        collegeName: true,
                        department: true,
                        academicYear: true,
                        bio: true,
                        profileImage: true,
                        skills: true,
                        interests: true
                    }
                }
            }
        });

        const formatted = connections.map((conn) => {
            const peer = conn.senderId === targetUserId ? conn.receiver : conn.sender;
            return {
                connectionId: conn.id,
                connectedAt: conn.updatedAt,
                student: peer
            };
        });

        return res.status(200).json({
            success: true,
            connections: formatted,
            total: formatted.length
        });
    } catch (error) {
        console.error("Get user connections error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load connections."
        });
    }
};
