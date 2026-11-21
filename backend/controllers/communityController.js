import prisma from '../prisma.js';

/**
 * GET /api/communities
 * List all communities with member counts and whether current user is a member.
 * Optional authentication.
 */
export const getAllCommunities = async (req, res) => {
  try {
    const currentUserId = req.user?.userId;

    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: { members: true },
        },
        members: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
      orderBy: {
        members: {
          _count: 'desc',
        },
      },
    });

    const formattedCommunities = communities.map((comm) => ({
      id: comm.id,
      name: comm.name,
      description: comm.description,
      tag: comm.tag,
      iconKey: comm.iconKey,
      membersCount: comm._count.members,
      isMember: currentUserId ? (comm.members?.length > 0) : false,
      createdAt: comm.createdAt,
    }));

    return res.status(200).json({
      success: true,
      communities: formattedCommunities,
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve communities.',
      error: error.message,
    });
  }
};

/**
 * POST /api/communities/:id/join
 * Join a community.
 * Requires authentication.
 */
export const joinCommunity = async (req, res) => {
  try {
    const communityId = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    if (isNaN(communityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid community ID.',
      });
    }

    // Verify community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found.',
      });
    }

    // Check if already a member
    const existingMembership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    if (existingMembership) {
      return res.status(409).json({
        success: false,
        message: 'You have already joined this community.',
      });
    }

    // Add membership
    await prisma.communityMember.create({
      data: {
        userId,
        communityId,
      },
    });

    const membersCount = await prisma.communityMember.count({
      where: { communityId },
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully joined community.',
      membersCount,
    });
  } catch (error) {
    console.error('Error joining community:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join community.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/communities/:id/leave
 * Leave a community.
 * Requires authentication.
 */
export const leaveCommunity = async (req, res) => {
  try {
    const communityId = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    if (isNaN(communityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid community ID.',
      });
    }

    // Verify membership exists
    const existingMembership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    if (!existingMembership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this community.',
      });
    }

    // Delete membership
    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    const membersCount = await prisma.communityMember.count({
      where: { communityId },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully left community.',
      membersCount,
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to leave community.',
      error: error.message,
    });
  }
};

/**
 * GET /api/communities/mine
 * Return communities the authenticated user has joined.
 * Requires authentication.
 */
export const getMyCommunities = async (req, res) => {
  try {
    const userId = req.user.userId;

    const memberships = await prisma.communityMember.findMany({
      where: { userId },
      include: {
        community: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const communities = memberships.map((m) => ({
      id: m.community.id,
      name: m.community.name,
      description: m.community.description,
      tag: m.community.tag,
      iconKey: m.community.iconKey,
      membersCount: m.community._count.members,
      isMember: true,
      joinedAt: m.joinedAt,
    }));

    return res.status(200).json({
      success: true,
      communities,
    });
  } catch (error) {
    console.error('Error fetching my communities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your communities.',
      error: error.message,
    });
  }
};
