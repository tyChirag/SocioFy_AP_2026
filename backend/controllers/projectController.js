import prisma from '../prisma.js';

/**
 * Format project object according to API response contract
 */
const formatProject = (project, currentUserId) => {
  const isMember = currentUserId
    ? (project.members?.some((m) => m.userId === currentUserId) || false)
    : false;

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    skills: project.skills,
    category: project.category,
    openPositions: project.openPositions,
    repoUrl: project.repoUrl,
    membersCount: project._count?.members ?? (project.members ? project.members.length : 0),
    isMember,
    creator: project.creator
      ? {
          id: project.creator.id,
          fullName: project.creator.fullName,
          collegeName: project.creator.collegeName,
          department: project.creator.department,
        }
      : null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

/**
 * GET /api/projects
 * List all projects with optional category filter.
 * Optional authentication.
 */
export const getAllProjects = async (req, res) => {
  try {
    const currentUserId = req.user?.userId;
    const { category } = req.query;

    const where = {};
    if (category && category !== 'All') {
      where.category = category;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            collegeName: true,
            department: true,
          },
        },
        _count: {
          select: { members: true },
        },
        members: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true, role: true },
            }
          : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedProjects = projects.map((proj) => formatProject(proj, currentUserId));

    return res.status(200).json({
      success: true,
      projects: formattedProjects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects.',
      error: error.message,
    });
  }
};

/**
 * POST /api/projects
 * Create a new project and automatically add the creator as ProjectMember (role: "Creator").
 * Requires authentication.
 */
export const createProject = async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const { title, description, skills, category, openPositions, repoUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project description is required.',
      });
    }

    const parsedOpenPositions =
      openPositions !== undefined && openPositions !== null && openPositions !== ''
        ? parseInt(openPositions, 10)
        : 0;

    if (isNaN(parsedOpenPositions) || parsedOpenPositions < 0) {
      return res.status(400).json({
        success: false,
        message: 'Open positions must be a non-negative integer.',
      });
    }

    // Create project and assign creator as member in a transaction
    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          skills: skills ? skills.trim() : '',
          category: category ? category.trim() : 'Other',
          openPositions: parsedOpenPositions,
          repoUrl: repoUrl && repoUrl.trim() ? repoUrl.trim() : null,
          creatorId,
          members: {
            create: {
              userId: creatorId,
              role: 'Creator',
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              collegeName: true,
              department: true,
            },
          },
          _count: {
            select: { members: true },
          },
          members: {
            select: { userId: true, role: true },
          },
        },
      });

      return project;
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: formatProject(newProject, creatorId),
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project.',
      error: error.message,
    });
  }
};

/**
 * POST /api/projects/:id/join
 * Join a project as a member.
 * Decrements openPositions by 1.
 * Requires authentication.
 */
export const joinProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.',
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (project.members.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You are already a member of this project.',
      });
    }

    if (project.openPositions <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No open positions available in this project.',
      });
    }

    // Join project and decrement openPositions atomically
    const updatedProject = await prisma.$transaction(async (tx) => {
      await tx.projectMember.create({
        data: {
          userId,
          projectId,
          role: 'Member',
        },
      });

      const updated = await tx.project.update({
        where: { id: projectId },
        data: {
          openPositions: {
            decrement: 1,
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              collegeName: true,
              department: true,
            },
          },
          _count: {
            select: { members: true },
          },
          members: {
            select: { userId: true, role: true },
          },
        },
      });

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully joined project.',
      project: formatProject(updatedProject, userId),
    });
  } catch (error) {
    console.error('Error joining project:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join project.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/projects/:id/leave
 * Leave a project. Creator cannot leave.
 * Increments openPositions by 1.
 * Requires authentication.
 */
export const leaveProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.',
      });
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      include: {
        project: true,
      },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this project.',
      });
    }

    if (membership.role === 'Creator' || membership.project.creatorId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Project creator cannot leave their own project.',
      });
    }

    // Remove member and increment openPositions atomically
    await prisma.$transaction(async (tx) => {
      await tx.projectMember.delete({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });

      await tx.project.update({
        where: { id: projectId },
        data: {
          openPositions: {
            increment: 1,
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully left project.',
    });
  } catch (error) {
    console.error('Error leaving project:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to leave project.',
      error: error.message,
    });
  }
};

/**
 * GET /api/projects/mine
 * List projects where current user is a member (either Creator or Member).
 * Requires authentication.
 */
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            creator: {
              select: {
                id: true,
                fullName: true,
                collegeName: true,
                department: true,
              },
            },
            _count: {
              select: { members: true },
            },
            members: {
              where: { userId },
              select: { userId: true, role: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const projects = memberships.map((m) => formatProject(m.project, userId));

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Error fetching my projects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your projects.',
      error: error.message,
    });
  }
};
