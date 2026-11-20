import prisma from "../prisma.js";

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
 * PUT /api/users/profile
 * Update the logged-in student's own profile.
 * Allowed editable fields: bio, skills, interests, linkedinUrl, githubUrl, profileImage.
 * Protected: cannot edit another student's profile.
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
            bio,
            skills,
            interests,
            linkedinUrl,
            githubUrl,
            profileImage
        } = req.body;

        // Build sanitized update object with only allowed profile fields
        const updateData = {};

        if (bio !== undefined) updateData.bio = typeof bio === "string" ? bio.trim().slice(0, 500) : null;
        if (skills !== undefined) updateData.skills = typeof skills === "string" ? skills.trim().slice(0, 300) : null;
        if (interests !== undefined) updateData.interests = typeof interests === "string" ? interests.trim().slice(0, 300) : null;
        if (linkedinUrl !== undefined) updateData.linkedinUrl = typeof linkedinUrl === "string" ? linkedinUrl.trim().slice(0, 200) : null;
        if (githubUrl !== undefined) updateData.githubUrl = typeof githubUrl === "string" ? githubUrl.trim().slice(0, 200) : null;
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
