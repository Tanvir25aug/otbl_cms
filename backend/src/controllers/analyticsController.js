const { Ticket, Project, Team, TeamMember, Sprint, User, TicketHistory } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Helper function to parse date range from query params
 */
const getDateRange = (req) => {
  const { startDate, endDate, range } = req.query;

  let start = null;
  let end = null;

  if (range) {
    // Predefined ranges
    const now = new Date();
    switch (range) {
      case '7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }
    if (!end) end = now;
  } else if (startDate || endDate) {
    // Custom date range
    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);
  }

  return { start, end };
};

/**
 * Get comprehensive project analytics
 * GET /api/analytics/projects/:id?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&range=7days|30days|90days|thisMonth|lastMonth|thisYear
 */
exports.getProjectAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = getDateRange(req);

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Build where clause with date filtering
    const where = { projectId: id };
    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt[Op.gte] = start;
      if (end) where.createdAt[Op.lte] = end;
    }

    // Get all tickets for this project (with optional date filter)
    const tickets = await Ticket.findAll({ where });
    const ticketIds = tickets.map(t => t.id);

    // Basic counts
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => !['Done', 'Closed'].includes(t.status)).length;
    const closedTickets = tickets.filter(t => ['Done', 'Closed'].includes(t.status)).length;

    // By status
    const ticketsByStatus = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});

    // By priority
    const ticketsByPriority = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {});

    // By type
    const ticketsByType = tickets.reduce((acc, ticket) => {
      acc[ticket.type] = (acc[ticket.type] || 0) + 1;
      return acc;
    }, {});

    // Overdue tickets
    const now = new Date();
    const overdueTickets = tickets.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) < now &&
      !['Done', 'Closed'].includes(t.status)
    ).length;

    // Average resolution time (for completed tickets)
    const completedTickets = tickets.filter(t => t.resolvedDate);
    let avgResolutionTime = 0;
    if (completedTickets.length > 0) {
      const totalResolutionTime = completedTickets.reduce((sum, ticket) => {
        const created = new Date(ticket.createdAt);
        const resolved = new Date(ticket.resolvedDate);
        return sum + (resolved - created);
      }, 0);
      avgResolutionTime = Math.round(totalResolutionTime / completedTickets.length / (1000 * 60 * 60)); // in hours
    }

    // Team stats
    const teams = await Team.findAll({ where: { projectId: id } });
    const activeTeams = teams.filter(t => t.status === 'Active').length;

    let totalMembers = 0;
    for (const team of teams) {
      const memberCount = await TeamMember.count({ where: { teamId: team.id } });
      totalMembers += memberCount;
    }

    // Sprint stats
    const sprints = await Sprint.findAll({ where: { projectId: id } });
    const activeSprints = sprints.filter(s => s.status === 'Active').length;
    const completedSprints = sprints.filter(s => s.status === 'Closed').length;

    // Story points
    const totalStoryPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedStoryPoints = tickets
      .filter(t => ['Done', 'Closed'].includes(t.status))
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // Time tracking
    const totalEstimatedHours = tickets.reduce((sum, t) => sum + (t.originalEstimate || 0), 0);
    const totalTimeSpent = tickets.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const totalRemainingHours = tickets.reduce((sum, t) => sum + (t.remainingEstimate || 0), 0);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTickets = tickets.filter(t => new Date(t.createdAt) >= thirtyDaysAgo).length;
    const recentlyClosed = tickets.filter(t =>
      t.resolvedDate && new Date(t.resolvedDate) >= thirtyDaysAgo
    ).length;

    // Ticket velocity (tickets closed per week for last 4 weeks)
    const velocity = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (7 * (i + 1)));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (7 * i));

      const closedThisWeek = tickets.filter(t => {
        if (!t.resolvedDate) return false;
        const resolved = new Date(t.resolvedDate);
        return resolved >= weekStart && resolved < weekEnd;
      }).length;

      velocity.unshift({ week: `Week -${i}`, closed: closedThisWeek });
    }

    res.status(200).json({
      project: {
        id: project.id,
        name: project.name,
        key: project.key,
        status: project.status
      },
      summary: {
        totalTickets,
        openTickets,
        closedTickets,
        overdueTickets,
        avgResolutionTimeHours: avgResolutionTime,
        completionRate: totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0
      },
      breakdown: {
        byStatus: ticketsByStatus,
        byPriority: ticketsByPriority,
        byType: ticketsByType
      },
      teams: {
        total: teams.length,
        active: activeTeams,
        totalMembers
      },
      sprints: {
        total: sprints.length,
        active: activeSprints,
        completed: completedSprints
      },
      storyPoints: {
        total: totalStoryPoints,
        completed: completedStoryPoints,
        remaining: totalStoryPoints - completedStoryPoints,
        completionRate: totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0
      },
      timeTracking: {
        estimatedHours: totalEstimatedHours,
        spentHours: totalTimeSpent,
        remainingHours: totalRemainingHours,
        variance: totalTimeSpent - totalEstimatedHours
      },
      recentActivity: {
        ticketsCreated30Days: recentTickets,
        ticketsClosed30Days: recentlyClosed,
        velocity
      }
    });
  } catch (error) {
    console.error('Error getting project analytics:', error);
    res.status(500).json({ message: 'Error getting project analytics', error: error.message });
  }
};

/**
 * Get team analytics and performance metrics
 * GET /api/analytics/teams/:id
 */
exports.getTeamAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: User, as: 'leader', attributes: ['id', 'email', 'fullName'] }
      ]
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Get all team members
    const members = await TeamMember.findAll({
      where: { teamId: id },
      include: [{ model: User, attributes: ['id', 'email', 'fullName', 'role'] }]
    });

    // Get all tickets for this team
    const tickets = await Ticket.findAll({ where: { teamId: id } });

    // Basic counts
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => !['Done', 'Closed'].includes(t.status)).length;
    const closedTickets = tickets.filter(t => ['Done', 'Closed'].includes(t.status)).length;

    // Member performance
    const memberPerformance = [];
    for (const member of members) {
      const assignedTickets = tickets.filter(t => t.assigneeId === member.userId);
      const completedTickets = assignedTickets.filter(t => ['Done', 'Closed'].includes(t.status));
      const inProgressTickets = assignedTickets.filter(t => t.status === 'In Progress');

      const totalTimeSpent = assignedTickets.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
      const storyPointsCompleted = completedTickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      memberPerformance.push({
        user: member.User,
        role: member.role,
        joinedAt: member.joinedAt,
        stats: {
          assignedTickets: assignedTickets.length,
          completedTickets: completedTickets.length,
          inProgress: inProgressTickets.length,
          timeSpent: totalTimeSpent,
          storyPointsCompleted,
          completionRate: assignedTickets.length > 0 ?
            Math.round((completedTickets.length / assignedTickets.length) * 100) : 0
        }
      });
    }

    // Workload distribution
    const workloadDistribution = memberPerformance.map(m => ({
      userId: m.user.id,
      userName: m.user.fullName,
      openTickets: m.stats.assignedTickets - m.stats.completedTickets,
      inProgress: m.stats.inProgress
    }));

    // Average handling time
    const completedWithTime = tickets.filter(t => t.resolvedDate);
    let avgHandlingTime = 0;
    if (completedWithTime.length > 0) {
      const totalTime = completedWithTime.reduce((sum, t) => {
        const created = new Date(t.createdAt);
        const resolved = new Date(t.resolvedDate);
        return sum + (resolved - created);
      }, 0);
      avgHandlingTime = Math.round(totalTime / completedWithTime.length / (1000 * 60 * 60)); // in hours
    }

    // Sprint velocity (if team has sprints)
    const sprints = await Sprint.findAll({
      where: { teamId: id },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const sprintVelocity = [];
    for (const sprint of sprints) {
      const sprintTickets = tickets.filter(t => t.sprintId === sprint.id);
      const completedInSprint = sprintTickets.filter(t => ['Done', 'Closed'].includes(t.status));
      const pointsCompleted = completedInSprint.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      sprintVelocity.push({
        sprintId: sprint.id,
        sprintName: sprint.name,
        status: sprint.status,
        pointsCommitted: sprint.totalPoints || 0,
        pointsCompleted,
        ticketsCompleted: completedInSprint.length,
        totalTickets: sprintTickets.length
      });
    }

    // Calculate average velocity
    const avgVelocity = sprintVelocity.length > 0 ?
      Math.round(sprintVelocity.reduce((sum, s) => sum + s.pointsCompleted, 0) / sprintVelocity.length) : 0;

    res.status(200).json({
      team: {
        id: team.id,
        name: team.name,
        status: team.status,
        project: team.project,
        leader: team.leader
      },
      summary: {
        totalMembers: members.length,
        totalTickets,
        openTickets,
        closedTickets,
        avgHandlingTimeHours: avgHandlingTime,
        completionRate: totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0
      },
      memberPerformance,
      workloadDistribution,
      velocity: {
        average: avgVelocity,
        sprints: sprintVelocity
      }
    });
  } catch (error) {
    console.error('Error getting team analytics:', error);
    res.status(500).json({ message: 'Error getting team analytics', error: error.message });
  }
};

/**
 * Get sprint analytics with burndown chart data
 * GET /api/analytics/sprints/:id
 */
exports.getSprintAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const sprint = await Sprint.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] }
      ]
    });

    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Get all tickets in this sprint
    const tickets = await Ticket.findAll({ where: { sprintId: id } });

    // Basic sprint metrics
    const totalTickets = tickets.length;
    const completedTickets = tickets.filter(t => ['Done', 'Closed'].includes(t.status)).length;
    const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
    const todoTickets = tickets.filter(t => ['Backlog', 'To Do'].includes(t.status)).length;

    // Story points
    const committedPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = tickets
      .filter(t => ['Done', 'Closed'].includes(t.status))
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const remainingPoints = committedPoints - completedPoints;

    // Scope changes (tickets added after sprint start)
    const sprintStartDate = sprint.startDate ? new Date(sprint.startDate) : new Date(sprint.createdAt);
    const addedAfterStart = tickets.filter(t => new Date(t.createdAt) > sprintStartDate).length;
    const scopeChange = addedAfterStart > 0 ? Math.round((addedAfterStart / totalTickets) * 100) : 0;

    // Burndown chart data
    const burndownData = [];
    if (sprint.startDate && sprint.endDate) {
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      // Ideal burndown (linear)
      const pointsPerDay = committedPoints / totalDays;

      for (let day = 0; day <= totalDays; day++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + day);

        // Calculate actual remaining points for this day
        const completedByThisDay = tickets.filter(t => {
          if (!t.resolvedDate) return false;
          return new Date(t.resolvedDate) <= currentDate && ['Done', 'Closed'].includes(t.status);
        }).reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        const actualRemaining = committedPoints - completedByThisDay;
        const idealRemaining = Math.max(0, committedPoints - (pointsPerDay * day));

        burndownData.push({
          day,
          date: currentDate.toISOString().split('T')[0],
          ideal: Math.round(idealRemaining),
          actual: actualRemaining
        });
      }
    }

    // Ticket breakdown by type and status
    const ticketsByType = tickets.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {});

    const ticketsByStatus = tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // Time tracking
    const totalEstimated = tickets.reduce((sum, t) => sum + (t.originalEstimate || 0), 0);
    const totalSpent = tickets.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const totalRemaining = tickets.reduce((sum, t) => sum + (t.remainingEstimate || 0), 0);

    res.status(200).json({
      sprint: {
        id: sprint.id,
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        project: sprint.project,
        team: sprint.team
      },
      summary: {
        totalTickets,
        completedTickets,
        inProgressTickets,
        todoTickets,
        completionRate: totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0
      },
      storyPoints: {
        committed: committedPoints,
        completed: completedPoints,
        remaining: remainingPoints,
        completionRate: committedPoints > 0 ? Math.round((completedPoints / committedPoints) * 100) : 0
      },
      scope: {
        initialTickets: totalTickets - addedAfterStart,
        addedTickets: addedAfterStart,
        scopeChangePercent: scopeChange
      },
      breakdown: {
        byType: ticketsByType,
        byStatus: ticketsByStatus
      },
      timeTracking: {
        estimatedHours: totalEstimated,
        spentHours: totalSpent,
        remainingHours: totalRemaining,
        variance: totalSpent - totalEstimated
      },
      burndown: burndownData
    });
  } catch (error) {
    console.error('Error getting sprint analytics:', error);
    res.status(500).json({ message: 'Error getting sprint analytics', error: error.message });
  }
};

/**
 * Get organization-wide analytics dashboard
 * GET /api/analytics/dashboard
 */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Overall project stats
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'Active' } });

    // Overall team stats
    const totalTeams = await Team.count();
    const activeTeams = await Team.count({ where: { status: 'Active' } });

    // Overall ticket stats
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({
      where: { status: { [Op.notIn]: ['Done', 'Closed'] } }
    });
    const closedTickets = await Ticket.count({
      where: { status: { [Op.in]: ['Done', 'Closed'] } }
    });

    // Overdue tickets
    const now = new Date();
    const overdueTickets = await Ticket.count({
      where: {
        dueDate: { [Op.lt]: now },
        status: { [Op.notIn]: ['Done', 'Closed'] }
      }
    });

    // Tickets by priority
    const ticketsByPriority = await Ticket.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    const priorityBreakdown = ticketsByPriority.reduce((acc, item) => {
      acc[item.priority] = parseInt(item.dataValues.count);
      return acc;
    }, {});

    // Tickets by status
    const ticketsByStatus = await Ticket.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const statusBreakdown = ticketsByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.dataValues.count);
      return acc;
    }, {});

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTickets = await Ticket.count({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } }
    });

    const recentlyClosed = await Ticket.count({
      where: {
        resolvedDate: { [Op.gte]: sevenDaysAgo }
      }
    });

    // Top projects by ticket count
    const topProjects = await Ticket.findAll({
      attributes: [
        'projectId',
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'ticketCount']
      ],
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'key', 'status']
      }],
      where: { projectId: { [Op.not]: null } },
      group: ['projectId', 'project.id', 'project.name', 'project.key', 'project.status'],
      order: [[sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'DESC']],
      limit: 5,
      raw: false
    });

    const formattedTopProjects = topProjects.map(item => ({
      project: item.project,
      ticketCount: parseInt(item.dataValues.ticketCount)
    }));

    // Active sprints
    const activeSprints = await Sprint.count({ where: { status: 'Active' } });

    // Total users
    const totalUsers = await User.count();

    res.status(200).json({
      overview: {
        projects: {
          total: totalProjects,
          active: activeProjects
        },
        teams: {
          total: totalTeams,
          active: activeTeams
        },
        tickets: {
          total: totalTickets,
          open: openTickets,
          closed: closedTickets,
          overdue: overdueTickets
        },
        sprints: {
          active: activeSprints
        },
        users: {
          total: totalUsers
        }
      },
      breakdown: {
        byPriority: priorityBreakdown,
        byStatus: statusBreakdown
      },
      recentActivity: {
        ticketsCreated7Days: recentTickets,
        ticketsClosed7Days: recentlyClosed
      },
      topProjects: formattedTopProjects
    });
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    res.status(500).json({ message: 'Error getting dashboard analytics', error: error.message });
  }
};

/**
 * Get user performance analytics
 * GET /api/analytics/users/:id
 */
exports.getUserAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'fullName', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get tickets assigned to user
    const assignedTickets = await Ticket.findAll({ where: { assigneeId: id } });
    const completedTickets = assignedTickets.filter(t => ['Done', 'Closed'].includes(t.status));
    const activeTickets = assignedTickets.filter(t => !['Done', 'Closed'].includes(t.status));

    // Get teams user belongs to
    const teamMemberships = await TeamMember.findAll({
      where: { userId: id },
      include: [{
        model: Team,
        include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'key'] }]
      }]
    });

    // Time tracking
    const totalTimeSpent = assignedTickets.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const storyPointsCompleted = completedTickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // Tickets by status
    const ticketsByStatus = assignedTickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // Recent completions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletions = completedTickets.filter(t =>
      t.resolvedDate && new Date(t.resolvedDate) >= thirtyDaysAgo
    ).length;

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      summary: {
        totalAssigned: assignedTickets.length,
        completed: completedTickets.length,
        active: activeTickets.length,
        completionRate: assignedTickets.length > 0 ?
          Math.round((completedTickets.length / assignedTickets.length) * 100) : 0,
        storyPointsCompleted,
        totalTimeSpent
      },
      teams: teamMemberships.map(tm => ({
        team: tm.Team,
        role: tm.role,
        joinedAt: tm.joinedAt
      })),
      breakdown: {
        byStatus: ticketsByStatus
      },
      recentActivity: {
        completionsLast30Days: recentCompletions
      }
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Error getting user analytics', error: error.message });
  }
};
