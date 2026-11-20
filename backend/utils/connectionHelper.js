import prisma from "../prisma.js";

/**
 * Public User profile fields to expose in conversation/message responses.
 * Never exposes passwords, hashes, tokens, or private data.
 */
export const publicUserSelect = {
    id: true,
    fullName: true,
    collegeName: true,
    department: true,
    academicYear: true,
    bio: true,
    profileImage: true
};

/**
 * Check if two students currently have an active ACCEPTED connection.
 * Regardless of who originally sent the request.
 *
 * @param {number} userAId
 * @param {number} userBId
 * @returns {Promise<boolean>}
 */
export const areUsersConnected = async (userAId, userBId) => {
    if (!userAId || !userBId || userAId === userBId) return false;

    const connection = await prisma.connection.findFirst({
        where: {
            status: "ACCEPTED",
            OR: [
                { senderId: userAId, receiverId: userBId },
                { senderId: userBId, receiverId: userAId }
            ]
        }
    });

    return Boolean(connection);
};
