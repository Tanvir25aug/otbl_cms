const { Project, ProjectMember, User, Team } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all projects (Admin/Super Admin see all, others see only assigned)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    let projects;

    if (req.user.role === 'Super Admin' || req.user.role === 'Admin') {
      // Admins see all projects
      projects = await Project.findAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'fullName', 'email'],
          },
          {
            model: ProjectMember,
            as: 'members',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'fullName', 'role']
            }]
          }
        ],
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Others see only assigned projects
      const userProjects = await ProjectMember.findAll({
        where: { userId: req.user.id },
        include: [{
          model: Project,
          as: 'project',
          where,
          include: [{
            model: User,
            as: 'creator',
            attributes: ['id', 'fullName', 'email']
          }]
        }]
      });

      projects = userProjects.map(pm => ({
        ...pm.project.toJSON(),
        userRole: pm.role
      }));

      // If user is NOT 'User' role, include General project
      if (req.user.role !== 'User') {
        const generalProject = await Project.findOne({
          where: { key: 'GENERAL', ...where },
          include: [{
            model: User,
            as: 'creator',
            attributes: ['id', 'fullName', 'email']
          }]
        });

        if (generalProject) {
          const hasGeneral = projects.some(p => p.key === 'GENERAL');
          if (!hasGeneral) {
            projects.unshift({
              ...generalProject.toJSON(),
              userRole: 'member',
              isGeneral: true
            });
          }
        }
      }
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'name', 'description', 'status'],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Manager, Admin, Super Admin)
exports.createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      status: status || 'Active',
      startDate,
      endDate,
      createdBy: req.user.id,
    });

    // Fetch the created project with associations
    const createdProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
      ],
    });

    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Manager, Admin, Super Admin)
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;

    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.update({
      name: name || project.name,
      description: description !== undefined ? description : project.description,
      status: status || project.status,
      startDate: startDate !== undefined ? startDate : project.startDate,
      endDate: endDate !== undefined ? endDate : project.endDate,
    });

    // Fetch updated project with associations
    const updatedProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'name', 'status'],
        },
      ],
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Super Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Private
exports.getProjectStats = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Team,
          as: 'teams',
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'fullName'],
            },
          ],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const stats = {
      totalTeams: project.teams.length,
      activeTeams: project.teams.filter(t => t.status === 'Active').length,
      totalMembers: project.teams.reduce((sum, team) => sum + (team.members?.length || 0), 0),
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project stats', error: error.message });
  }
};

// ============= PROJECT MEMBERSHIP MANAGEMENT =============

// @desc    Get user's assigned projects
// @route   GET /api/projects/my-projects
// @access  Private
exports.getMyProjects = async (req, res) => {
  try {
    const userProjects = await ProjectMember.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Project,
        as: 'project',
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        }]
      }],
      order: [[{ model: Project, as: 'project' }, 'name', 'ASC']]
    });

    let projects = userProjects.map(pm => ({
      ...pm.project.toJSON(),
      userRole: pm.role,
      membershipId: pm.id
    }));

    // If user is NOT 'User' role, include General project
    if (req.user.role !== 'User') {
      const generalProject = await Project.findOne({
        where: { key: 'GENERAL' },
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        }]
      });

      if (generalProject) {
        const hasGeneral = projects.some(p => p.key === 'GENERAL');
        if (!hasGeneral) {
          projects.unshift({
            ...generalProject.toJSON(),
            userRole: 'member',
            isGeneral: true
          });
        }
      }
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Error fetching user projects', error: error.message });
  }
};

// @desc    Get project members
// @route   GET /api/projects/:id/members
// @access  Private
exports.getProjectMembers = async (req, res) => {
  try {
    const members = await ProjectMember.findAll({
      where: { projectId: req.params.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'fullName', 'role']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(members);
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({ message: 'Error fetching project members', error: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin, Super Admin)
exports.addProjectMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const projectId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    const existing = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (existing) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Create membership
    const membership = await ProjectMember.create({
      projectId,
      userId,
      role: role || 'member'
    });

    const memberWithUser = await ProjectMember.findByPk(membership.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'fullName', 'role']
      }]
    });

    res.status(201).json({
      message: 'User added to project successfully',
      membership: memberWithUser
    });
  } catch (error) {
    console.error('Error adding project member:', error);
    res.status(500).json({ message: 'Error adding project member', error: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin, Super Admin)
exports.removeProjectMember = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;

    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    await membership.destroy();

    res.status(200).json({ message: 'User removed from project successfully' });
  } catch (error) {
    console.error('Error removing project member:', error);
    res.status(500).json({ message: 'Error removing project member', error: error.message });
  }
};

// @desc    Bulk add members to project
// @route   POST /api/projects/:id/members/bulk
// @access  Private (Admin, Super Admin)
exports.bulkAddMembers = async (req, res) => {
  try {
    const { userIds, role } = req.body;
    const projectId = req.params.id;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get existing memberships
    const existingMemberships = await ProjectMember.findAll({
      where: {
        projectId,
        userId: { [Op.in]: userIds }
      }
    });

    const existingUserIds = existingMemberships.map(m => m.userId);
    const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return res.status(400).json({ message: 'All users are already members of this project' });
    }

    // Create memberships
    const memberships = newUserIds.map(userId => ({
      projectId,
      userId,
      role: role || 'member',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await ProjectMember.bulkCreate(memberships);

    res.status(201).json({
      message: `${newUserIds.length} users added to project successfully`,
      addedCount: newUserIds.length,
      skippedCount: existingUserIds.length
    });
  } catch (error) {
    console.error('Error bulk adding members:', error);
    res.status(500).json({ message: 'Error bulk adding members', error: error.message });
  }
};

// @desc    Update member role
// @route   PATCH /api/projects/:id/members/:userId/role
// @access  Private (Admin, Super Admin)
exports.updateMemberRole = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Valid role (admin/member) is required' });
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    membership.role = role;
    await membership.save();

    res.status(200).json({ message: 'Member role updated successfully', membership });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Error updating member role', error: error.message });
  }
};
