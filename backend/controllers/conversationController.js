import prisma from "../prisma.js";
import { areUsersConnected, publicUserSelect } from "../utils/connectionHelper.js";
import { getIO } from "../socket.js";

/**
 * POST /api/conversations
 * Create or retrieve an existing conversation with another student.
 * Access policy: ONLY permitted with students who have an active ACCEPTED connection.
 * Body: { "userId": 12 }
 */
export const createOrGetConversation = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const targetUserId = parseInt(req.body?.userId, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "A valid student userId is required."
            });
        }

        if (currentUserId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot start a conversation with yourself."
            });
        }

        // Verify target student exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: publicUserSelect
        });

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Target student not found."
            });
        }

        // Verify active ACCEPTED connection
        const isConnected = await areUsersConnected(currentUserId, targetUserId);
        if (!isConnected) {
            return res.status(403).json({
                success: false,
                message: "Private messaging is only permitted between students with an accepted connection."
            });
        }

        // Canonical ID ordering: smaller user ID is always userOneId
        const userOneId = Math.min(currentUserId, targetUserId);
        const userTwoId = Math.max(currentUserId, targetUserId);

        // Find existing or create new conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                userOneId_userTwoId: { userOneId, userTwoId }
            },
            include: {
                userOne: { select: publicUserSelect },
                userTwo: { select: publicUserSelect },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: { sender: { select: publicUserSelect } }
                }
            }
        });

        if (!conversation) {
            try {
                conversation = await prisma.conversation.create({
                    data: { userOneId, userTwoId },
                    include: {
                        userOne: { select: publicUserSelect },
                        userTwo: { select: publicUserSelect },
                        messages: {
                            take: 1,
                            orderBy: { createdAt: "desc" },
                            include: { sender: { select: publicUserSelect } }
                        }
                    }
                });
            } catch (err) {
                // Handle concurrent creation race condition (unique constraint)
                if (err.code === "P2002") {
                    conversation = await prisma.conversation.findUnique({
                        where: {
                            userOneId_userTwoId: { userOneId, userTwoId }
                        },
                        include: {
                            userOne: { select: publicUserSelect },
                            userTwo: { select: publicUserSelect },
                            messages: {
                                take: 1,
                                orderBy: { createdAt: "desc" },
                                include: { sender: { select: publicUserSelect } }
                            }
                        }
                    });
                } else {
                    throw err;
                }
            }
        }

        const otherParticipant = conversation.userOneId === currentUserId ? conversation.userTwo : conversation.userOne;

        return res.status(200).json({
            success: true,
            conversation: {
                id: conversation.id,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
                otherParticipant,
                latestMessage: conversation.messages[0] || null
            }
        });
    } catch (error) {
        console.error("Create or get conversation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to initialize conversation."
        });
    }
};

/**
 * GET /api/conversations
 * Fetch all conversations for the authenticated user, ordered by latest activity.
 * Includes unread message counts, preview of latest message, and other participant's profile.
 */
export const getMyConversations = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // Fetch conversations where user is participant
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { userOneId: currentUserId },
                    { userTwoId: currentUserId }
                ]
            },
            orderBy: { updatedAt: "desc" },
            include: {
                userOne: { select: publicUserSelect },
                userTwo: { select: publicUserSelect },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        createdAt: true,
                        readAt: true
                    }
                }
            }
        });

        if (conversations.length === 0) {
            return res.status(200).json({
                success: true,
                conversations: []
            });
        }

        const conversationIds = conversations.map((c) => c.id);

        // Compute unread message counts per conversation in a single query
        const unreadCounts = await prisma.message.groupBy({
            by: ["conversationId"],
            where: {
                conversationId: { in: conversationIds },
                senderId: { not: currentUserId },
                readAt: null
            },
            _count: { id: true }
        });

        const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count.id]));

        const formatted = conversations.map((conv) => {
            const otherParticipant = conv.userOneId === currentUserId ? conv.userTwo : conv.userOne;
            return {
                id: conv.id,
                otherParticipant,
                latestMessage: conv.messages[0] || null,
                unreadCount: unreadMap.get(conv.id) || 0,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt
            };
        });

        return res.status(200).json({
            success: true,
            conversations: formatted
        });
    } catch (error) {
        console.error("Get my conversations error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load conversations."
        });
    }
};

/**
 * GET /api/conversations/:id
 * Fetch conversation details by ID.
 * Access policy: User must be one of the two participants.
 */
export const getConversationById = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const conversationId = parseInt(req.params.id, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID."
            });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                userOne: { select: publicUserSelect },
                userTwo: { select: publicUserSelect }
            }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (conversation.userOneId !== currentUserId && conversation.userTwoId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view this conversation."
            });
        }

        const isConnected = await areUsersConnected(conversation.userOneId, conversation.userTwoId);
        const otherParticipant = conversation.userOneId === currentUserId ? conversation.userTwo : conversation.userOne;

        return res.status(200).json({
            success: true,
            conversation: {
                id: conversation.id,
                otherParticipant,
                isConnected,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            }
        });
    } catch (error) {
        console.error("Get conversation by id error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load conversation details."
        });
    }
};

/**
 * GET /api/conversations/:id/messages
 * Fetch messages for a conversation with pagination (limit and beforeId).
 * Messages are returned in chronological order.
 */
export const getConversationMessages = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const conversationId = parseInt(req.params.id, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID."
            });
        }

        // Verify conversation and participant membership
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, userOneId: true, userTwoId: true }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (conversation.userOneId !== currentUserId && conversation.userTwoId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view messages in this conversation."
            });
        }

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
        const beforeId = req.query.beforeId ? parseInt(req.query.beforeId, 10) : null;

        const whereClause = { conversationId };
        if (beforeId && !isNaN(beforeId)) {
            whereClause.id = { lt: beforeId };
        }

        // Fetch limit + 1 items ordered newest first to determine hasMore
        const messages = await prisma.message.findMany({
            where: whereClause,
            take: limit + 1,
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" }
            ],
            include: {
                sender: { select: publicUserSelect }
            }
        });

        const hasMore = messages.length > limit;
        const result = hasMore ? messages.slice(0, limit) : messages;

        // Reverse to return messages in chronological order (oldest to newest)
        result.reverse();

        return res.status(200).json({
            success: true,
            messages: result,
            hasMore,
            nextBeforeId: hasMore ? result[0]?.id : null
        });
    } catch (error) {
        console.error("Get conversation messages error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load messages."
        });
    }
};

/**
 * POST /api/conversations/:id/messages
 * Send a new message inside an existing conversation.
 * Verifies:
 * - Current user is a participant.
 * - Current user and other participant still have an active ACCEPTED connection.
 * - Message content is non-empty and <= 5000 chars.
 */
export const sendMessage = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const conversationId = parseInt(req.params.id, 10);
        const { content } = req.body;

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID."
            });
        }

        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message content cannot be empty."
            });
        }

        if (content.trim().length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Message exceeds maximum length of 5000 characters."
            });
        }

        // Verify conversation exists and user is a participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, userOneId: true, userTwoId: true }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (conversation.userOneId !== currentUserId && conversation.userTwoId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to send messages in this conversation."
            });
        }

        // Verify that the two participants still have an active ACCEPTED connection
        const otherUserId = conversation.userOneId === currentUserId ? conversation.userTwoId : conversation.userOneId;
        const isConnected = await areUsersConnected(currentUserId, otherUserId);

        if (!isConnected) {
            return res.status(403).json({
                success: false,
                message: "Cannot send message. Messaging requires an active accepted connection between both students."
            });
        }

        // Create message in database
        const newMessage = await prisma.message.create({
            data: {
                conversationId,
                senderId: currentUserId,
                content: content.trim()
            },
            include: {
                sender: { select: publicUserSelect }
            }
        });

        // Update conversation's updatedAt timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        // Broadcast through Socket.io if available
        const io = getIO();
        if (io) {
            io.to(`conversation:${conversationId}`).emit("message:new", newMessage);
            io.to(`user:${otherUserId}`).emit("message:new", newMessage);
        }

        return res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error("Send message error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send message."
        });
    }
};

/**
 * PATCH /api/conversations/:id/read
 * Mark all unread messages sent by the other participant as read.
 */
export const markConversationRead = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const conversationId = parseInt(req.params.id, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID."
            });
        }

        // Verify conversation membership
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, userOneId: true, userTwoId: true }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (conversation.userOneId !== currentUserId && conversation.userTwoId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this conversation."
            });
        }

        const now = new Date();

        // Update all unread messages sent by the OTHER participant
        const updateResult = await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: currentUserId },
                readAt: null
            },
            data: {
                readAt: now
            }
        });

        // Broadcast read receipt via Socket.IO
        const io = getIO();
        if (io && updateResult.count > 0) {
            const otherParticipantId = conversation.userOneId === currentUserId ? conversation.userTwoId : conversation.userOneId;
            const readPayload = {
                conversationId,
                readerId: currentUserId,
                readAt: now,
                readCount: updateResult.count
            };
            io.to(`conversation:${conversationId}`).emit("message:read:update", readPayload);
            io.to(`user:${otherParticipantId}`).emit("message:read:update", readPayload);
        }

        return res.status(200).json({
            success: true,
            readCount: updateResult.count,
            readAt: now
        });
    } catch (error) {
        console.error("Mark conversation read error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update read status."
        });
    }
};
