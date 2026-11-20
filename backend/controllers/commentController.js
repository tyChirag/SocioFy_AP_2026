import prisma from "../prisma.js";

/**
 * Delete a comment
 * DELETE /api/comments/:id
 * Only the author of the comment can delete it.
 */
export const deleteComment = async (req, res) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        const currentUserId = req.user?.userId ? Number(req.user.userId) : null;

        if (isNaN(commentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID."
            });
        }

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // Find the comment first
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found."
            });
        }

        // Verify ownership: only author can delete
        if (comment.userId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment."
            });
        }

        // Delete comment
        await prisma.comment.delete({
            where: { id: commentId }
        });

        // Get updated comments count for this post
        const updatedCount = await prisma.comment.count({
            where: { postId: comment.postId }
        });

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully.",
            postId: comment.postId,
            commentsCount: updatedCount
        });
    } catch (error) {
        console.error("Delete comment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete comment. Please try again."
        });
    }
};
