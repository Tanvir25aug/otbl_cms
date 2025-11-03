const { User, Ticket, Notification, ProjectMember, Project } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// @desc    Get current user's profile with stats and activity
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ticket Statistics
    const openTickets = await Ticket.count({ where: { assigneeId: userId, status: { [Op.ne]: 'Closed' } } });
    const closedTickets = await Ticket.count({ where: { assigneeId: userId, status: 'Closed' } });
    const assignedTickets = await Ticket.count({ where: { assigneeId: userId } });
    const pendingTickets = await Ticket.count({ where: { assigneeId: userId, status: 'Pending' } });

    const ticketStats = {
      openTickets,
      closedTickets,
      assignedTickets,
      pendingTickets,
    };

    // Recent Activity (Notifications)
    const recentActivity = await Notification.findAll({
      where: {
        [Op.or]: [
          { recipientUserId: userId },
          { recipientRole: req.user.role },
          { recipientRole: 'All' }
        ]
      },
      limit: 10,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      user: req.user,
      ticketStats,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting profile data', error: error.message });
  }
};

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  // req.user is attached by the protect middleware
  res.status(200).json(req.user);
};

// @desc    Update current user's profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = async (req, res) => {
  const { fullName, phoneNumber, designation, division } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.designation = designation || user.designation;
    user.division = division || user.division;

    // In a real app, you might handle profile picture uploads separately
    // For now, we'll assume profilePicture is a URL string if provided
    if (req.body.profilePicture) {
        user.profilePicture = req.body.profilePicture;
    }

    await user.save();

    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(200).json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private (Super Admin, Admin)
exports.createUser = async (req, res) => {
  const { fullName, email, password, role, designation, division, projects } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      designation,
      division,
      status: 'active' // Default status
    });

    // Assign projects if provided
    if (projects && Array.isArray(projects) && projects.length > 0) {
      const projectMemberships = projects.map(projectId => ({
        projectId,
        userId: newUser.id,
        role: 'member'
      }));
      await ProjectMember.bulkCreate(projectMemberships);
    }

    const userResponse = { ...newUser.toJSON() };
    delete userResponse.password; // Ensure password hash is not sent back

    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Super Admin, Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query; // Get role from query parameters
    let whereClause = {};

    if (role) {
      whereClause.role = role;
    }

    const users = await User.findAll({
      where: whereClause, // Apply the filter
      attributes: { exclude: ['password'] } // Exclude passwords from the result
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// @desc    Update a user by ID
// @route   PUT /api/users/:id
// @access  Private (Super Admin, Admin)
exports.updateUser = async (req, res) => {
  const { fullName, email, role, status, designation, division } = req.body;

  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent non-Super Admins from editing a Super Admin
    if (user.role === 'Super Admin' && req.user.role !== 'Super Admin') {
        return res.status(403).json({ message: 'Forbidden: Only Super Admins can modify other Super Admins.' });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;
    user.designation = designation || user.designation;
    user.division = division || user.division;

    await user.save();
    
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(200).json({ message: 'User updated successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent users from deleting themselves via this endpoint
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account via this route.' });
        }

        // Prevent non-Super Admins from deleting a Super Admin
        if (user.role === 'Super Admin') {
            return res.status(403).json({ message: 'Forbidden: Super Admins cannot be deleted.' });
        }

        await user.destroy();

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// @desc    Get user's assigned projects
// @route   GET /api/users/:id/projects
// @access  Private (Admin, Super Admin)
exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's project memberships
    const projectMemberships = await ProjectMember.findAll({
      where: { userId },
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'key', 'description', 'status']
      }]
    });

    const projects = projectMemberships.map(pm => pm.project);

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Error fetching user projects', error: error.message });
  }
};

// @desc    Update user's project assignments
// @route   PUT /api/users/:id/projects
// @access  Private (Admin, Super Admin)
exports.updateUserProjects = async (req, res) => {
  try {
    const userId = req.params.id;
    const { projectIds } = req.body;

    // Validate input
    if (!Array.isArray(projectIds)) {
      return res.status(400).json({ message: 'projectIds must be an array' });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove all existing project memberships
    await ProjectMember.destroy({ where: { userId } });

    // Create new project memberships
    if (projectIds.length > 0) {
      const projectMemberships = projectIds.map(projectId => ({
        projectId,
        userId,
        role: 'member'
      }));
      await ProjectMember.bulkCreate(projectMemberships);
    }

    res.status(200).json({
      message: 'User project assignments updated successfully',
      projectCount: projectIds.length
    });
  } catch (error) {
    console.error('Error updating user projects:', error);
    res.status(500).json({ message: 'Error updating user projects', error: error.message });
  }
};