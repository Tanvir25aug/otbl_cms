const { Ticket, Notification, TicketLink, User, Sprint, TicketHistory, TicketAttachment, Comment, Project, TimeLog, ProjectMember } = require('../models');
const { Op } = require('sequelize');
const {
  notifyTicketAssigned,
  notifyTicketReassigned,
  notifyStatusChanged,
  notifyPriorityChanged,
  notifyProjectAssigned
} = require('../services/notificationService');

exports.getAllTickets = async (req, res) => {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.status) where.status = req.query.status;
    if (req.query.assigneeId) where.assigneeId = req.query.assigneeId;
    if (req.query.sprintId) where.sprintId = req.query.sprintId;
    if (req.query.type) where.type = req.query.type;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.isFlagged !== undefined) where.isFlagged = req.query.isFlagged === 'true';
    if (req.query.isArchived !== undefined) where.isArchived = req.query.isArchived === 'true';

    // PROJECT-BASED ACCESS CONTROL
    if (req.user.role === 'Super Admin' || req.user.role === 'Admin') {
      // Super Admin and Admin see ALL tickets
      // No additional filtering needed
    } else {
      // Get user's assigned projects
      const userProjects = await ProjectMember.findAll({
        where: { userId: req.user.id },
        attributes: ['projectId']
      });

      let projectIds = userProjects.map(pm => pm.projectId);

      // If user role is NOT 'User', include General project
      if (req.user.role !== 'User') {
        const generalProject = await Project.findOne({
          where: { key: 'GENERAL' },
          attributes: ['id']
        });

        if (generalProject && !projectIds.includes(generalProject.id)) {
          projectIds.push(generalProject.id);
        }
      }

      // Filter tickets by user's project IDs
      if (projectIds.length > 0) {
        where.projectId = { [Op.in]: projectIds };
      } else {
        // User has no projects assigned, return empty
        return res.status(200).json([]);
      }
    }

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] },
        { model: User, as: 'reporter', attributes: ['id', 'email', 'fullName'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
        { model: Ticket, as: 'parent', attributes: ['id', 'title'] },
        { model: Ticket, as: 'epic', attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Error getting tickets', error });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const {
      title, description, priority, category, assigneeId, projectId, type, severity,
      dueDate, parentId, sprintId, epicId, startDate, storyPoints,
      originalEstimate, labels, components, affectedVersions, fixVersions, environment
    } = req.body;

    const userId = req.user.id;
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const parsedStartDate = startDate ? new Date(startDate) : null;

    // Validate projectId if provided
    if (projectId) {
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(400).json({ message: 'Invalid project ID. Project does not exist.' });
      }
    }

    // Validate sprintId if provided
    if (sprintId) {
      const sprint = await Sprint.findByPk(sprintId);
      if (!sprint) {
        return res.status(400).json({ message: 'Invalid sprint ID. Sprint does not exist.' });
      }
      // Validate sprint belongs to project if both are provided
      if (projectId && sprint.projectId !== parseInt(projectId)) {
        return res.status(400).json({ message: 'Sprint does not belong to the specified project.' });
      }
    }

    // Validate assigneeId if provided
    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId);
      if (!assignee) {
        return res.status(400).json({ message: 'Invalid assignee ID. User does not exist.' });
      }
    }

    const sanitized = {
      title,
      description,
      priority: priority || 'Medium',
      category,
      userId,
      reporterId: userId,
      assigneeId: assigneeId || null,
      projectId: projectId || null,
      type: type || 'Task',
      severity: severity || null,
      dueDate: parsedDueDate,
      startDate: parsedStartDate,
      parentId: parentId || null,
      sprintId: sprintId || null,
      epicId: epicId || null,
      storyPoints: storyPoints || null,
      originalEstimate: originalEstimate || null,
      remainingEstimate: originalEstimate || null,
      labels: labels || [],
      components: components || [],
      affectedVersions: affectedVersions || [],
      fixVersions: fixVersions || [],
      environment: environment || null,
      watchers: [userId], // Add creator as watcher
    };

    const ticket = await Ticket.create(sanitized);

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        ticketId: ticket.id,
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId: userId,
      }));
      await TicketAttachment.bulkCreate(attachments);
    }

    // Create history entry
    await TicketHistory.create({
      ticketId: ticket.id,
      userId: userId,
      action: 'created',
      description: `Ticket created by ${req.user.email || 'User'}`,
    });

    // Persist and emit a notification to Managers and Agents
    const notif = await Notification.create({
      title: 'New Ticket Created',
      message: `Ticket #${ticket.id} "${ticket.title}" was created.`,
      type: 'ticket_created',
      recipientRole: 'All',
      ticketId: ticket.id
    });
    req.io.emit('notification', { id: notif.id, title: notif.title, message: notif.message, type: notif.type, ticket: ticket });

    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Error creating ticket', error });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] },
        { model: User, as: 'reporter', attributes: ['id', 'email', 'fullName'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
        { model: Ticket, as: 'parent', attributes: ['id', 'title'] },
        { model: Ticket, as: 'epic', attributes: ['id', 'title'] },
        { model: TicketAttachment, as: 'attachments' },
        { model: Comment, include: [
          { model: User, attributes: ['id', 'email', 'fullName'] }
        ]}
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Get linked tickets
    const links = await TicketLink.findAll({
      where: {
        [Op.or]: [
          { sourceTicketId: req.params.id },
          { targetTicketId: req.params.id }
        ]
      },
      include: [
        { model: Ticket, as: 'source', attributes: ['id', 'title', 'status'] },
        { model: Ticket, as: 'target', attributes: ['id', 'title', 'status'] }
      ]
    });

    res.status(200).json({ ...ticket.toJSON(), links });
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({ message: 'Error getting ticket', error });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldValues = { ...ticket.dataValues };
    const {
      title, description, status, priority, category, assigneeId, projectId, type, severity,
      dueDate, startDate, resolution, resolutionComment, sprintId, epicId, storyPoints,
      originalEstimate, remainingEstimate, timeSpent, labels, components, affectedVersions,
      fixVersions, environment, isFlagged, isArchived
    } = req.body;

    // Validate projectId if being updated
    if (projectId !== undefined && projectId !== null) {
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(400).json({ message: 'Invalid project ID. Project does not exist.' });
      }
    }

    // Validate sprintId if being updated
    if (sprintId !== undefined && sprintId !== null) {
      const sprint = await Sprint.findByPk(sprintId);
      if (!sprint) {
        return res.status(400).json({ message: 'Invalid sprint ID. Sprint does not exist.' });
      }
      // Validate sprint belongs to project
      const updatedProjectId = projectId !== undefined ? projectId : ticket.projectId;
      if (updatedProjectId && sprint.projectId !== parseInt(updatedProjectId)) {
        return res.status(400).json({ message: 'Sprint does not belong to the specified project.' });
      }
    }

    // Validate assigneeId if being updated
    if (assigneeId !== undefined && assigneeId !== null) {
      const assignee = await User.findByPk(assigneeId);
      if (!assignee) {
        return res.status(400).json({ message: 'Invalid assignee ID. User does not exist.' });
      }
    }

    // Track changes for history
    const changes = [];
    const fieldsToUpdate = {
      title, description, status, priority, category, assigneeId, projectId, type, severity,
      dueDate, startDate, resolution, resolutionComment, sprintId, epicId, storyPoints,
      originalEstimate, remainingEstimate, timeSpent, labels, components, affectedVersions,
      fixVersions, environment, isFlagged, isArchived
    };

    for (const [field, newValue] of Object.entries(fieldsToUpdate)) {
      if (newValue !== undefined && JSON.stringify(oldValues[field]) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue: JSON.stringify(oldValues[field]),
          newValue: JSON.stringify(newValue)
        });
        ticket[field] = newValue;
      }
    }

    // Auto-set resolvedDate when status changes to Done or Closed
    if (status && (status === 'Done' || status === 'Closed') && !oldValues.resolvedDate) {
      ticket.resolvedDate = new Date();
    }

    await ticket.save();

    // Create history entries for each change
    for (const change of changes) {
      await TicketHistory.create({
        ticketId: ticket.id,
        userId: req.user.id,
        action: 'updated',
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        description: `${change.field} changed from ${change.oldValue} to ${change.newValue}`,
      });
    }

    // Send smart notifications based on specific changes
    try {
      const assignee = ticket.assigneeId ? await User.findByPk(ticket.assigneeId) : null;

      // Notify about status change
      if (status !== undefined && oldValues.status !== status && assignee) {
        await notifyStatusChanged(ticket, oldValues.status, status, req.user, assignee);
      }

      // Notify about priority change
      if (priority !== undefined && oldValues.priority !== priority && assignee) {
        await notifyPriorityChanged(ticket, oldValues.priority, priority, req.user, assignee);
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.status(200).json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Error updating ticket', error });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { assigneeId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const oldAssigneeId = ticket.assigneeId;
    const newAssignee = assigneeId ? await User.findByPk(assigneeId) : null;
    if (assigneeId && !newAssignee) return res.status(404).json({ message: 'Assignee not found' });

    const oldAssignee = oldAssigneeId ? await User.findByPk(oldAssigneeId) : null;

    ticket.assigneeId = assigneeId || null;
    await ticket.save();

    // Create history entry with detailed reassignment information
    let historyDescription = '';
    let historyAction = '';
    let oldValue = null;
    let newValue = null;

    if (oldAssigneeId && oldAssigneeId !== assigneeId) {
      // Reassignment
      historyAction = 'reassigned';
      const oldName = oldAssignee ? (oldAssignee.fullName || oldAssignee.email) : 'Unassigned';
      const newName = newAssignee ? (newAssignee.fullName || newAssignee.email) : 'Unassigned';
      oldValue = oldName;
      newValue = newName;
      historyDescription = `Ticket reassigned from ${oldName} to ${newName}`;
    } else if (!oldAssigneeId && assigneeId) {
      // First assignment
      historyAction = 'assigned';
      const newName = newAssignee ? (newAssignee.fullName || newAssignee.email) : 'Unknown';
      newValue = newName;
      historyDescription = `Ticket assigned to ${newName}`;
    } else if (oldAssigneeId && !assigneeId) {
      // Unassignment
      historyAction = 'unassigned';
      const oldName = oldAssignee ? (oldAssignee.fullName || oldAssignee.email) : 'Unknown';
      oldValue = oldName;
      historyDescription = `Ticket unassigned from ${oldName}`;
    }

    if (historyDescription) {
      await TicketHistory.create({
        ticketId: ticket.id,
        userId: req.user.id,
        action: historyAction,
        field: 'assignee',
        oldValue: oldValue,
        newValue: newValue,
        description: historyDescription,
      });
    }

    // Fetch ticket with all includes to return complete data
    const updatedTicket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] },
        { model: User, as: 'reporter', attributes: ['id', 'email', 'fullName'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key', 'description'] },
        { model: Sprint, as: 'sprint' },
      ]
    });

    // Send notification
    try {
      if (newAssignee && req.user) {
        if (oldAssigneeId && oldAssigneeId !== assigneeId) {
          // Reassignment
          await notifyTicketReassigned(ticket, newAssignee, oldAssignee, req.user);
        } else if (!oldAssigneeId) {
          // First assignment
          await notifyTicketAssigned(ticket, newAssignee, req.user);
        }
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({ message: 'Assignee updated', ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning ticket', error });
  }
};

exports.assignProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] }]
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Validate project exists if provided
    let project = null;
    if (projectId) {
      project = await Project.findByPk(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });
    }

    ticket.projectId = projectId || null;
    await ticket.save();

    // Fetch ticket with all includes to return complete data
    const updatedTicket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] },
        { model: User, as: 'reporter', attributes: ['id', 'email', 'fullName'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key', 'description'] },
        { model: Sprint, as: 'sprint' },
      ]
    });

    // Send notification to assignee
    try {
      if (project && ticket.assignee && req.user) {
        await notifyProjectAssigned(ticket, project, req.user, ticket.assignee);
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.status(200).json({ message: 'Project updated', ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning project', error });
  }
};

exports.linkTickets = async (req, res) => {
  try {
    const { targetTicketId, relation } = req.body;
    const source = await Ticket.findByPk(req.params.id);
    const target = await Ticket.findByPk(targetTicketId);
    if (!source || !target) return res.status(404).json({ message: 'Ticket not found' });
    const link = await TicketLink.create({ sourceTicketId: source.id, targetTicketId: target.id, relation: relation || 'relates' });
    res.status(201).json({ message: 'Tickets linked', link });
  } catch (error) {
    res.status(500).json({ message: 'Error linking tickets', error });
  }
};

exports.unlinkTickets = async (req, res) => {
  try {
    const { targetTicketId } = req.body;
    const deleted = await TicketLink.destroy({ where: { sourceTicketId: req.params.id, targetTicketId } });
    res.status(200).json({ message: 'Tickets unlinked', deleted });
  } catch (error) {
    res.status(500).json({ message: 'Error unlinking tickets', error });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    await ticket.destroy();
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket', error });
  }
};

exports.getTicketCount = async (req, res) => {
  try {
    const count = await Ticket.count();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting ticket count', error });
  }
};

// Add watcher to ticket
exports.addWatcher = async (req, res) => {
  try {
    const { userId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const watchers = ticket.watchers || [];
    if (!watchers.includes(userId)) {
      watchers.push(userId);
      ticket.watchers = watchers;
      await ticket.save();
    }

    res.status(200).json({ message: 'Watcher added', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error adding watcher', error });
  }
};

// Remove watcher from ticket
exports.removeWatcher = async (req, res) => {
  try {
    const { userId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const watchers = ticket.watchers || [];
    ticket.watchers = watchers.filter(id => id !== userId);
    await ticket.save();

    res.status(200).json({ message: 'Watcher removed', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error removing watcher', error });
  }
};

// Log time spent on ticket
exports.logTime = async (req, res) => {
  try {
    const { timeSpent } = req.body; // in hours
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.timeSpent = (ticket.timeSpent || 0) + timeSpent;
    if (ticket.remainingEstimate && ticket.remainingEstimate > 0) {
      ticket.remainingEstimate = Math.max(0, ticket.remainingEstimate - timeSpent);
    }
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'time_logged',
      description: `${timeSpent} hours logged`,
    });

    res.status(200).json({ message: 'Time logged', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error logging time', error });
  }
};

// Get ticket history
exports.getTicketHistory = async (req, res) => {
  try {
    const history = await TicketHistory.findAll({
      where: { ticketId: req.params.id },
      include: [{ model: User, attributes: ['id', 'email', 'fullName'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error getting history', error });
  }
};

// Toggle ticket flag
exports.toggleFlag = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.isFlagged = !ticket.isFlagged;
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: ticket.isFlagged ? 'flagged' : 'unflagged',
      description: `Ticket ${ticket.isFlagged ? 'flagged' : 'unflagged'}`,
    });

    res.status(200).json({ message: 'Flag toggled', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling flag', error });
  }
};

// Archive ticket
exports.archiveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.isArchived = true;
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'archived',
      description: 'Ticket archived',
    });

    res.status(200).json({ message: 'Ticket archived', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error archiving ticket', error });
  }
};

// Quick Action: Assign to Me
exports.assignToMe = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const oldAssignee = ticket.assigneeId;
    ticket.assigneeId = req.user.id;
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'assigned',
      field: 'assigneeId',
      oldValue: oldAssignee?.toString(),
      newValue: req.user.id.toString(),
      description: `Ticket assigned to ${req.user.fullName || req.user.email}`,
    });

    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] },
        { model: User, as: 'reporter', attributes: ['id', 'email', 'fullName'] },
      ],
    });

    res.status(200).json({ message: 'Ticket assigned to you', ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning ticket', error: error.message });
  }
};

// Quick Action: Mark as Urgent/High Priority
exports.markUrgent = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const oldPriority = ticket.priority;
    ticket.priority = 'Highest';
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'priority_changed',
      field: 'priority',
      oldValue: oldPriority,
      newValue: 'Highest',
      description: `Priority changed from ${oldPriority} to Highest`,
    });

    res.status(200).json({ message: 'Ticket marked as urgent', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error marking ticket as urgent', error: error.message });
  }
};

// Quick Action: Close Ticket
exports.closeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const oldStatus = ticket.status;
    ticket.status = 'Closed';
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'status_changed',
      field: 'status',
      oldValue: oldStatus,
      newValue: 'Closed',
      description: `Ticket closed (was ${oldStatus})`,
    });

    res.status(200).json({ message: 'Ticket closed', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error closing ticket', error: error.message });
  }
};

// Quick Action: Reopen Ticket
exports.reopenTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const oldStatus = ticket.status;
    ticket.status = 'To Do';
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'reopened',
      field: 'status',
      oldValue: oldStatus,
      newValue: 'To Do',
      description: `Ticket reopened (was ${oldStatus})`,
    });

    res.status(200).json({ message: 'Ticket reopened', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error reopening ticket', error: error.message });
  }
};

// Quick Action: Clone/Duplicate Ticket
exports.cloneTicket = async (req, res) => {
  try {
    const originalTicket = await Ticket.findByPk(req.params.id);
    if (!originalTicket) return res.status(404).json({ message: 'Ticket not found' });

    // Create a clone with similar data
    const clonedTicket = await Ticket.create({
      title: `[CLONE] ${originalTicket.title}`,
      description: originalTicket.description,
      priority: originalTicket.priority,
      category: originalTicket.category,
      type: originalTicket.type,
      severity: originalTicket.severity,
      projectId: originalTicket.projectId,
      sprintId: originalTicket.sprintId,
      assigneeId: req.user.id, // Assign clone to current user
      reporterId: req.user.id,
      status: 'Backlog', // Reset status
      labels: originalTicket.labels,
      components: originalTicket.components,
      environment: originalTicket.environment,
    });

    await TicketHistory.create({
      ticketId: clonedTicket.id,
      userId: req.user.id,
      action: 'cloned',
      description: `Cloned from ticket #${originalTicket.id}`,
    });

    await TicketHistory.create({
      ticketId: originalTicket.id,
      userId: req.user.id,
      action: 'cloned',
      description: `Ticket cloned to #${clonedTicket.id}`,
    });

    res.status(201).json({ message: 'Ticket cloned successfully', ticket: clonedTicket });
  } catch (error) {
    res.status(500).json({ message: 'Error cloning ticket', error: error.message });
  }
};

// Change ticket status
exports.changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const validStatuses = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Done', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status', validStatuses });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'status_changed',
      field: 'status',
      oldValue: oldStatus,
      newValue: status,
      description: `Status changed from ${oldStatus} to ${status}`,
    });

    res.status(200).json({ message: 'Status changed', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error changing status', error: error.message });
  }
};

// Get ticket activity history/timeline
exports.getTicketHistory = async (req, res) => {
  try {
    const history = await TicketHistory.findAll({
      where: { ticketId: req.params.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket history', error: error.message });
  }
};

// Log time on ticket
exports.logTime = async (req, res) => {
  try {
    const { timeSpent, description } = req.body;

    if (!timeSpent || timeSpent <= 0) {
      return res.status(400).json({ message: 'Time spent must be greater than 0' });
    }

    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const timeLog = await TimeLog.create({
      ticketId: req.params.id,
      userId: req.user.id,
      timeSpent,
      description: description || 'Time logged',
    });

    await TicketHistory.create({
      ticketId: req.params.id,
      userId: req.user.id,
      action: 'time_logged',
      description: `Logged ${timeSpent} hours${description ? ': ' + description : ''}`,
    });

    const logWithUser = await TimeLog.findByPk(timeLog.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'fullName'] },
      ],
    });

    res.status(201).json({ message: 'Time logged successfully', timeLog: logWithUser });
  } catch (error) {
    res.status(500).json({ message: 'Error logging time', error: error.message });
  }
};

// Get time logs for ticket
exports.getTimeLogs = async (req, res) => {
  try {
    const timeLogs = await TimeLog.findAll({
      where: { ticketId: req.params.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'fullName'] },
      ],
      order: [['loggedAt', 'DESC']],
    });

    // Calculate total time
    const totalTime = timeLogs.reduce((sum, log) => sum + parseFloat(log.timeSpent), 0);

    res.status(200).json({ timeLogs, totalTime });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time logs', error: error.message });
  }
};
