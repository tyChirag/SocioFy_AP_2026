import prisma from "../prisma.js";
import { getIO } from "../socket.js";

/**
 * DELETE /api/messages/:id
 * Delete a message authored by the authenticated student.
 * Ownership: Only the message's sender can delete it.
 */
export const deleteMessage = async (req, res) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id ? Number(req.user?.userId || req.user?.id) : null;
        const messageId = parseInt(req.params.id, 10);

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (isNaN(messageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID."
            });
        }

        // Find message
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: { id: true, senderId: true, conversationId: true }
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found."
            });
        }

        // Enforce strict ownership
        if (message.senderId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete another student's message."
            });
        }

        // Delete from database
        await prisma.message.delete({
            where: { id: messageId }
        });

        // Broadcast deletion event to room if socket is available
        const io = getIO();
        if (io) {
            io.to(`conversation:${message.conversationId}`).emit("message:deleted", {
                messageId,
                conversationId: message.conversationId
            });
        }

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully."
        });
    } catch (error) {
        console.error("Delete message error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete message."
        });
    }
};
