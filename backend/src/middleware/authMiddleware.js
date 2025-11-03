const jwt = require('jsonwebtoken');
const { User, TeamMember, Team, Project, Ticket } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
      
      // Attach user to the request, excluding the password
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).send('Not authorized, user not found');
      }

      next();
    } catch (error) {
      return res.status(401).send('Not authorized, token failed');
    }
  } else {
    res.status(401).send('Not authorized, no token');
  }
};

const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden. Requires one of these roles: ${roles.join(', ')}` });
    }
    next();
  };
};

/**
 * Check if user is a member of a specific team
 */
const isTeamMember = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.params.id;
    const userId = req.user.id;

    // Super Admin and Admin can access all teams
    if (['Super Admin', 'Admin'].includes(req.user.role)) {
      return next();
    }

    // Check if user is a member of the team
    const membership = await TeamMember.findOne({
      where: { teamId, userId }
    });

    // Also check if user is the team leader
    const team = await Team.findByPk(teamId);
    if (team && team.leaderId === userId) {
      return next();
    }

    if (!membership) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this team.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking team membership:', error);
    res.status(500).json({ message: 'Error checking permissions', error: error.message });
  }
};

/**
 * Check if user can access a project
 * Users can access a project if they are:
 * - Super Admin or Admin
 * - Manager
 * - Member of any team in the project
 * - Creator of the project
 */
const canAccessProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const userId = req.user.id;

    // Super Admin, Admin, and Manager can access all projects
    if (['Super Admin', 'Admin', 'Manager'].includes(req.user.role)) {
      return next();
    }

    // Check if user created the project
    const project = await Project.findByPk(projectId);
    if (project && project.createdBy === userId) {
      return next();
    }

    // Check if user is a member of any team in this project
    const teams = await Team.findAll({ where: { projectId } });
    const teamIds = teams.map(t => t.id);

    if (teamIds.length > 0) {
      const membership = await TeamMember.findOne({
        where: {
          teamId: { [require('sequelize').Op.in]: teamIds },
          userId
        }
      });

      if (membership) {
        return next();
      }
    }

    return res.status(403).json({
      message: 'Access denied. You do not have access to this project.'
    });
  } catch (error) {
    console.error('Error checking project access:', error);
    res.status(500).json({ message: 'Error checking permissions', error: error.message });
  }
};

/**
 * Check if user can access a ticket
 * Users can access a ticket if they:
 * - Are Super Admin or Admin
 * - Are assigned to it
 * - Created it
 * - Are a member of the ticket's team
 * - Are a Manager
 */
const canAccessTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id || req.params.ticketId;
    const userId = req.user.id;

    // Super Admin, Admin, and Manager can access all tickets
    if (['Super Admin', 'Admin', 'Manager'].includes(req.user.role)) {
      return next();
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is assigned to or created the ticket
    if (ticket.assigneeId === userId || ticket.userId === userId || ticket.reporterId === userId) {
      return next();
    }

    // Check if user is in the ticket's team
    if (ticket.teamId) {
      const membership = await TeamMember.findOne({
        where: { teamId: ticket.teamId, userId }
      });
      if (membership) {
        return next();
      }
    }

    return res.status(403).json({
      message: 'Access denied. You do not have access to this ticket.'
    });
  } catch (error) {
    console.error('Error checking ticket access:', error);
    res.status(500).json({ message: 'Error checking permissions', error: error.message });
  }
};

/**
 * Check if user can modify a team
 * Users can modify a team if they:
 * - Are Super Admin or Admin
 * - Are the team leader
 * - Are a Manager
 */
const canModifyTeam = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.params.id;
    const userId = req.user.id;

    // Super Admin, Admin, and Manager can modify all teams
    if (['Super Admin', 'Admin', 'Manager'].includes(req.user.role)) {
      return next();
    }

    // Check if user is the team leader
    const team = await Team.findByPk(teamId);
    if (team && team.leaderId === userId) {
      return next();
    }

    return res.status(403).json({
      message: 'Access denied. You do not have permission to modify this team.'
    });
  } catch (error) {
    console.error('Error checking team modification permission:', error);
    res.status(500).json({ message: 'Error checking permissions', error: error.message });
  }
};

/**
 * Check if user is team leader
 */
const isTeamLeader = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.params.id;
    const userId = req.user.id;

    // Super Admin and Admin bypass this check
    if (['Super Admin', 'Admin'].includes(req.user.role)) {
      return next();
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leaderId !== userId) {
      return res.status(403).json({
        message: 'Access denied. Only the team leader can perform this action.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking team leader:', error);
    res.status(500).json({ message: 'Error checking permissions', error: error.message });
  }
};

module.exports = {
  protect,
  hasRole,
  isTeamMember,
  canAccessProject,
  canAccessTicket,
  canModifyTeam,
  isTeamLeader
};