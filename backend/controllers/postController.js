import prisma from "../prisma.js";

/**
 * Create a new Post
 * POST /api/posts
 * Requires authentication (req.user populated by authenticateToken)
 */
export const createPost = async (req, res) => {
    try {
        const { content } = req.body;

        // 1. Validate that content is present and not just whitespace
        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post content cannot be empty."
            });
        }

        // 2. Identify the authenticated user using req.user
        const authorId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!authorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to create a post."
            });
        }

        // 3. Save post using Prisma with author relation
        const newPost = await prisma.post.create({
            data: {
                content: content.trim(),
                authorId: Number(authorId)
            },
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
                        academicYear: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        // 4. Return the newly created post with author details & normalized engagement
        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: {
                ...newPost,
                likesCount: 0,
                commentsCount: 0,
                isLiked: false,
                isLikedByCurrentUser: false
            }
        });
    } catch (error) {
        console.error("Create post error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create post. Please try again later."
        });
    }
};

/**
 * Fetch All Posts
 * GET /api/posts
 * Allows all registered students to see posts from everyone, ordered newest first.
 * Accurately determines isLikedByCurrentUser based strictly on the authenticated user.
 */
export const getAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        // Pagination parameters with safe defaults
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const skip = (page - 1) * limit;

        // Fetch posts ordered newest first with author profile and counts
        const posts = await prisma.post.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },
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
                        academicYear: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                // If logged in, fetch whether the current user specifically liked this post
                likes: currentUserId
                    ? {
                          where: { userId: currentUserId },
                          select: { id: true }
                      }
                    : false
            }
        });

        // Format posts cleanly and determine isLiked / isLikedByCurrentUser
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
            posts: formattedPosts
        });
    } catch (error) {
        console.error("Fetch posts error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch posts. Please try again later."
        });
    }
};

/**
 * Fetch a single Post by ID
 * GET /api/posts/:id
 * Used for direct post links (/post/:id)
 */
export const getPostById = async (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (isNaN(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID."
            });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
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
                        academicYear: true
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

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        const hasLiked = currentUserId ? (Boolean(post.likes) && post.likes.length > 0) : false;
        const { likes, ...rest } = post;

        return res.status(200).json({
            success: true,
            post: {
                ...rest,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
                isLiked: hasLiked,
                isLikedByCurrentUser: hasLiked
            }
        });
    } catch (error) {
        console.error("Get post by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load post. Please try again later."
        });
    }
};

/**
 * Like a Post
 * POST /api/posts/:id/like
 * Authenticated user likes a post.
 * Uses both userId and postId with composite unique constraint.
 */
export const likePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const userId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (isNaN(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID."
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to like a post."
            });
        }

        // Check if the post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        // Check whether this particular user has already liked this particular post
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        // Only insert if not already liked
        if (!existingLike) {
            await prisma.like.create({
                data: {
                    postId,
                    userId
                }
            });
        }

        // Calculate actual total number of unique likes for this post
        const totalLikesCount = await prisma.like.count({
            where: { postId }
        });

        return res.status(200).json({
            success: true,
            message: "Post liked successfully.",
            isLiked: true,
            isLikedByCurrentUser: true,
            likesCount: totalLikesCount
        });
    } catch (error) {
        console.error("Like post error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to like post. Please try again later."
        });
    }
};

/**
 * Unlike a Post
 * DELETE /api/posts/:id/like
 * Authenticated user unlikes a post.
 * Deletes ONLY that user's Like record using both userId and postId.
 */
export const unlikePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const userId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (isNaN(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID."
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to unlike a post."
            });
        }

        // Check if the post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        // Delete ONLY this user's like on this specific post
        await prisma.like.deleteMany({
            where: {
                postId,
                userId
            }
        });

        // Calculate actual total number of unique likes for this post
        const totalLikesCount = await prisma.like.count({
            where: { postId }
        });

        return res.status(200).json({
            success: true,
            message: "Post unliked successfully.",
            isLiked: false,
            isLikedByCurrentUser: false,
            likesCount: totalLikesCount
        });
    } catch (error) {
        console.error("Unlike post error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to unlike post. Please try again later."
        });
    }
};

/**
 * Get all Comments for a Post
 * GET /api/posts/:id/comments
 * Returns comments in chronological order (oldest first) with author public profile.
 */
export const getCommentsByPost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);

        if (isNaN(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID."
            });
        }

        // Check if the post exists
        const postExists = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true }
        });

        if (!postExists) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        // Fetch comments oldest first
        const comments = await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        collegeName: true,
                        department: true,
                        academicYear: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            comments
        });
    } catch (error) {
        console.error("Get comments error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load comments. Please try again later."
        });
    }
};

/**
 * Create a Comment on a Post
 * POST /api/posts/:id/comments
 * Authenticated student creates a comment.
 */
export const createComment = async (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const userId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const { content } = req.body;

        if (isNaN(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID."
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to comment."
            });
        }

        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment text cannot be empty."
            });
        }

        // Verify post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        // Create comment in Prisma
        const newComment = await prisma.comment.create({
            data: {
                content: content.trim(),
                postId,
                userId
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        collegeName: true,
                        department: true,
                        academicYear: true
                    }
                }
            }
        });

        // Get updated comments count for this post
        const commentsCount = await prisma.comment.count({
            where: { postId }
        });

        return res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            comment: newComment,
            commentsCount
        });
    } catch (error) {
        console.error("Create comment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add comment. Please try again later."
        });
    }
};
