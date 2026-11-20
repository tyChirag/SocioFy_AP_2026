import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "./prisma.js";
import { areUsersConnected, publicUserSelect } from "./utils/connectionHelper.js";

let ioInstance = null;

// Track online users across multiple tabs/devices: userId (number) -> Set<socketId>
const onlineUsers = new Map();

/**
 * Initialize Socket.IO with HTTP server
 */
export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PATCH", "DELETE"]
        }
    });

    // 1. JWT Authentication Middleware
    io.use((socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace("Bearer ", "")?.trim();

            if (!token || token === "undefined" || token === "null") {
                return next(new Error("Authentication error: Missing token"));
            }

            const secret = process.env.JWT_SECRET || "sociofy_secret_jwt_key_2026";
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    return next(new Error("Authentication error: Invalid or expired token"));
                }
                socket.user = decoded;
                next();
            });
        } catch (error) {
            console.error("Socket auth error:", error);
            return next(new Error("Authentication error"));
        }
    });

    // 2. Connection Handler
    io.on("connection", (socket) => {
        const userId = Number(socket.user?.userId || socket.user?.id);

        if (!userId) {
            socket.disconnect();
            return;
        }

        // Join personal user room for direct user-level alerts
        socket.join(`user:${userId}`);

        // Register online status tracking
        let userSockets = onlineUsers.get(userId);
        const isFirstConnection = !userSockets || userSockets.size === 0;

        if (!userSockets) {
            userSockets = new Set();
            onlineUsers.set(userId, userSockets);
        }
        userSockets.add(socket.id);

        if (isFirstConnection) {
            // Broadcast user:online event
            io.emit("user:online", { userId });
        }

        // Send current list of online users to the newly connected socket
        socket.emit("users:online", { userIds: Array.from(onlineUsers.keys()) });

        // 3. Event: conversation:join
        socket.on("conversation:join", async (data, callback) => {
            try {
                const conversationId = parseInt(data?.conversationId, 10);
                if (isNaN(conversationId)) {
                    socket.emit("message:error", { message: "Invalid conversation ID" });
                    if (callback) callback({ success: false, message: "Invalid conversation ID" });
                    return;
                }

                // Verify conversation membership
                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { id: true, userOneId: true, userTwoId: true }
                });

                if (!conversation) {
                    socket.emit("message:error", { message: "Conversation not found" });
                    if (callback) callback({ success: false, message: "Conversation not found" });
                    return;
                }

                if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
                    socket.emit("message:error", { message: "Unauthorized to access this conversation" });
                    if (callback) callback({ success: false, message: "Unauthorized" });
                    return;
                }

                const roomName = `conversation:${conversationId}`;
                socket.join(roomName);

                socket.emit("conversation:joined", { conversationId });
                if (callback) callback({ success: true, conversationId });
            } catch (error) {
                console.error("conversation:join error:", error);
                socket.emit("message:error", { message: "Failed to join conversation room" });
                if (callback) callback({ success: false, message: "Server error" });
            }
        });

        // 4. Event: conversation:leave
        socket.on("conversation:leave", (data) => {
            const conversationId = parseInt(data?.conversationId, 10);
            if (!isNaN(conversationId)) {
                socket.leave(`conversation:${conversationId}`);
            }
        });

        // 5. Event: message:send
        socket.on("message:send", async (data, callback) => {
            try {
                const conversationId = parseInt(data?.conversationId, 10);
                const content = data?.content;

                if (isNaN(conversationId)) {
                    const err = { message: "Invalid conversation ID" };
                    socket.emit("message:error", err);
                    if (callback) callback({ success: false, ...err });
                    return;
                }

                if (!content || typeof content !== "string" || !content.trim()) {
                    const err = { message: "Message content cannot be empty" };
                    socket.emit("message:error", err);
                    if (callback) callback({ success: false, ...err });
                    return;
                }

                if (content.trim().length > 5000) {
                    const err = { message: "Message exceeds maximum length of 5000 characters" };
                    socket.emit("message:error", err);
                    if (callback) callback({ success: false, ...err });
                    return;
                }

                // Verify conversation and membership
                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { id: true, userOneId: true, userTwoId: true }
                });

                if (!conversation) {
                    const err = { message: "Conversation not found" };
                    socket.emit("message:error", err);
                    if (callback) callback({ success: false, ...err });
                    return;
                }

                if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
                    const err = { message: "Unauthorized to send messages in this conversation" };
                    socket.emit("message:error", err);
                    if (callback) callback({ success: false, ...err });
                    return;
                }

                // Verify active accepted connection
                const otherUserId = conversation.userOneId === userId ? conversation.userTwoId : conversation.userOneId;
                const isConnected = await areUsersConnected(userId, otherUserId);

                if (!isConnected) {
                    const err = { message: "Cannot send message. Messaging requires an active accepted connection." };
                    socket.emit("message:error", err);
                    if (callback) callback({ success: false, ...err });
                    return;
                }

                // Save message in PostgreSQL
                const newMessage = await prisma.message.create({
                    data: {
                        conversationId,
                        senderId: userId,
                        content: content.trim()
                    },
                    include: {
                        sender: { select: publicUserSelect }
                    }
                });

                // Update conversation last activity
                await prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() }
                });

                // Broadcast message:new to conversation room
                io.to(`conversation:${conversationId}`).emit("message:new", newMessage);

                // Also notify other user's personal room in case they haven't opened the chat room
                io.to(`user:${otherUserId}`).emit("message:new", newMessage);

                if (callback) {
                    callback({ success: true, message: newMessage });
                }
            } catch (error) {
                console.error("message:send error:", error);
                const err = { message: "Failed to send message" };
                socket.emit("message:error", err);
                if (callback) callback({ success: false, ...err });
            }
        });

        // 6. Event: typing:start
        socket.on("typing:start", async (data) => {
            try {
                const conversationId = parseInt(data?.conversationId, 10);
                if (isNaN(conversationId)) return;

                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { userOneId: true, userTwoId: true }
                });

                if (conversation && (conversation.userOneId === userId || conversation.userTwoId === userId)) {
                    socket.to(`conversation:${conversationId}`).emit("typing:update", {
                        conversationId,
                        userId,
                        isTyping: true
                    });
                }
            } catch (err) {
                console.error("typing:start error:", err);
            }
        });

        // 7. Event: typing:stop
        socket.on("typing:stop", async (data) => {
            try {
                const conversationId = parseInt(data?.conversationId, 10);
                if (isNaN(conversationId)) return;

                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { userOneId: true, userTwoId: true }
                });

                if (conversation && (conversation.userOneId === userId || conversation.userTwoId === userId)) {
                    socket.to(`conversation:${conversationId}`).emit("typing:update", {
                        conversationId,
                        userId,
                        isTyping: false
                    });
                }
            } catch (err) {
                console.error("typing:stop error:", err);
            }
        });

        // 8. Event: message:read
        socket.on("message:read", async (data) => {
            try {
                const conversationId = parseInt(data?.conversationId, 10);
                if (isNaN(conversationId)) return;

                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { userOneId: true, userTwoId: true }
                });

                if (!conversation || (conversation.userOneId !== userId && conversation.userTwoId !== userId)) {
                    return;
                }

                const now = new Date();
                const result = await prisma.message.updateMany({
                    where: {
                        conversationId,
                        senderId: { not: userId },
                        readAt: null
                    },
                    data: { readAt: now }
                });

                if (result.count > 0) {
                    const otherUserId = conversation.userOneId === userId ? conversation.userTwoId : conversation.userOneId;
                    const readPayload = {
                        conversationId,
                        readerId: userId,
                        readAt: now,
                        readCount: result.count
                    };
                    io.to(`conversation:${conversationId}`).emit("message:read:update", readPayload);
                    io.to(`user:${otherUserId}`).emit("message:read:update", readPayload);
                }
            } catch (err) {
                console.error("message:read error:", err);
            }
        });

        // 9. Disconnect Handler
        socket.on("disconnect", () => {
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                    io.emit("user:offline", { userId });
                }
            }
        });
    });

    ioInstance = io;
    return io;
};

/**
 * Getter for current Socket.io instance
 */
export const getIO = () => ioInstance;

/**
 * Check if a specific student is currently online
 * @param {number} userId
 */
export const isUserOnline = (userId) => {
    const sockets = onlineUsers.get(Number(userId));
    return Boolean(sockets && sockets.size > 0);
};

/**
 * Return all currently online user IDs
 */
export const getOnlineUserIds = () => {
    return Array.from(onlineUsers.keys());
};
