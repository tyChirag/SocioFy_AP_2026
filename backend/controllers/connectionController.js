import prisma from "../prisma.js";

/**
 * Helper to extract student public profile fields
 */
const publicStudentSelect = {
    id: true,
    fullName: true,
    collegeName: true,
    department: true,
    academicYear: true,
    bio: true,
    profileImage: true,
    skills: true,
    interests: true
};

/**
 * POST /api/connections/:userId
 * Send a connection request to another student.
 * Protected: prevents self-connection, duplicate requests, and conflicting requests.
 */
export const sendConnectionRequest = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const targetUserId = parseInt(req.params.userId, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to connect with students."
            });
        }

        if (isNaN(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        // Prevent self-connection
        if (currentUserId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot connect with yourself."
            });
        }

        // Verify target student exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, fullName: true }
        });

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Target student not found."
            });
        }

        // Check for existing connection between the two users in either direction
        const existingConnection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: currentUserId }
                ]
            }
        });

        if (existingConnection) {
            if (existingConnection.status === "ACCEPTED") {
                return res.status(400).json({
                    success: false,
                    message: `You are already connected with ${targetUser.fullName}.`
                });
            }

            if (existingConnection.status === "PENDING") {
                if (existingConnection.senderId === currentUserId) {
                    return res.status(400).json({
                        success: false,
                        message: "Connection request has already been sent and is pending approval."
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: `${targetUser.fullName} has already sent you a connection request. Please check your incoming requests.`
                    });
                }
            }

            // If previously rejected, re-open the request
            if (existingConnection.status === "REJECTED") {
                const refreshed = await prisma.connection.update({
                    where: { id: existingConnection.id },
                    data: {
                        senderId: currentUserId,
                        receiverId: targetUserId,
                        status: "PENDING"
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: `Connection request sent to ${targetUser.fullName}.`,
                    connection: refreshed
                });
            }
        }

        // Create new pending connection request
        const connection = await prisma.connection.create({
            data: {
                senderId: currentUserId,
                receiverId: targetUserId,
                status: "PENDING"
            }
        });

        return res.status(201).json({
            success: true,
            message: `Connection request sent to ${targetUser.fullName}.`,
            connection
        });
    } catch (error) {
        console.error("Send connection error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send connection request. Please try again."
        });
    }
};

/**
 * GET /api/connections/requests
 * Get incoming connection requests for current user (where receiverId = currentUserId).
 */
export const getIncomingRequests = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const requests = await prisma.connection.findMany({
            where: {
                receiverId: currentUserId,
                status: "PENDING"
            },
            orderBy: { createdAt: "desc" },
            include: {
                sender: {
                    select: publicStudentSelect
                }
            }
        });

        return res.status(200).json({
            success: true,
            requests
        });
    } catch (error) {
        console.error("Get incoming requests error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch incoming connection requests."
        });
    }
};

/**
 * GET /api/connections/sent
 * Get sent pending connection requests by current user (where senderId = currentUserId).
 */
export const getSentRequests = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const sentRequests = await prisma.connection.findMany({
            where: {
                senderId: currentUserId,
                status: "PENDING"
            },
            orderBy: { createdAt: "desc" },
            include: {
                receiver: {
                    select: publicStudentSelect
                }
            }
        });

        return res.status(200).json({
            success: true,
            sentRequests
        });
    } catch (error) {
        console.error("Get sent requests error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sent connection requests."
        });
    }
};

/**
 * PATCH /api/connections/:id/accept
 * Accept an incoming connection request.
 * Ownership: Only the receiver can accept.
 */
export const acceptConnectionRequest = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const connectionId = parseInt(req.params.id, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(connectionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid connection ID."
            });
        }

        const connection = await prisma.connection.findUnique({
            where: { id: connectionId },
            include: {
                sender: { select: { fullName: true } }
            }
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found."
            });
        }

        // Only the receiver can accept
        if (connection.receiverId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this connection request."
            });
        }

        if (connection.status === "ACCEPTED") {
            return res.status(400).json({
                success: false,
                message: "Connection request has already been accepted."
            });
        }

        const updated = await prisma.connection.update({
            where: { id: connectionId },
            data: { status: "ACCEPTED" }
        });

        return res.status(200).json({
            success: true,
            message: `You are now connected with ${connection.sender.fullName}!`,
            connection: updated
        });
    } catch (error) {
        console.error("Accept connection error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to accept connection request."
        });
    }
};

/**
 * PATCH /api/connections/:id/reject
 * Reject an incoming connection request.
 * Ownership: Only the receiver can reject.
 */
export const rejectConnectionRequest = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const connectionId = parseInt(req.params.id, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(connectionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid connection ID."
            });
        }

        const connection = await prisma.connection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found."
            });
        }

        // Only the receiver can reject
        if (connection.receiverId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reject this connection request."
            });
        }

        const updated = await prisma.connection.update({
            where: { id: connectionId },
            data: { status: "REJECTED" }
        });

        return res.status(200).json({
            success: true,
            message: "Connection request declined.",
            connection: updated
        });
    } catch (error) {
        console.error("Reject connection error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject connection request."
        });
    }
};

/**
 * DELETE /api/connections/:id
 * Cancel a pending connection request sent by current user.
 * Ownership: Only the sender can cancel.
 */
export const cancelSentRequest = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const connectionId = parseInt(req.params.id, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(connectionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid connection ID."
            });
        }

        const connection = await prisma.connection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found."
            });
        }

        // Only the sender can cancel their sent request
        if (connection.senderId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this request."
            });
        }

        if (connection.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a request that is not pending."
            });
        }

        await prisma.connection.delete({
            where: { id: connectionId }
        });

        return res.status(200).json({
            success: true,
            message: "Connection request cancelled."
        });
    } catch (error) {
        console.error("Cancel connection error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel connection request."
        });
    }
};

/**
 * GET /api/connections
 * Get all accepted connections for the current user.
 */
export const getMyConnections = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const connections = await prisma.connection.findMany({
            where: {
                status: "ACCEPTED",
                OR: [{ senderId: currentUserId }, { receiverId: currentUserId }]
            },
            orderBy: { updatedAt: "desc" },
            include: {
                sender: { select: publicStudentSelect },
                receiver: { select: publicStudentSelect }
            }
        });

        // Normalize peer student object
        const formatted = connections.map((conn) => {
            const peerStudent = conn.senderId === currentUserId ? conn.receiver : conn.sender;
            return {
                connectionId: conn.id,
                connectedAt: conn.updatedAt,
                student: peerStudent
            };
        });

        return res.status(200).json({
            success: true,
            connections: formatted,
            total: formatted.length
        });
    } catch (error) {
        console.error("Get my connections error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load connections."
        });
    }
};

/**
 * DELETE /api/connections/:id/remove
 * Remove an existing accepted connection.
 * Authorization: Either connected student can remove.
 */
export const removeConnection = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const connectionId = parseInt(req.params.id, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(connectionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid connection ID."
            });
        }

        const connection = await prisma.connection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection not found."
            });
        }

        // Either participant can remove the connection
        if (connection.senderId !== currentUserId && connection.receiverId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to remove this connection."
            });
        }

        await prisma.connection.delete({
            where: { id: connectionId }
        });

        return res.status(200).json({
            success: true,
            message: "Connection removed successfully."
        });
    } catch (error) {
        console.error("Remove connection error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove connection."
        });
    }
};
