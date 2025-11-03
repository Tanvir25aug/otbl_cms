const { Notification } = require('../models');

// Notification type configurations
const NOTIFICATION_TYPES = {
  TICKET_ASSIGNED: {
    icon: 'ticket',
    color: '#3b82f6',
    category: 'assignment',
    priority: 'medium'
  },
  TICKET_REASSIGNED: {
    icon: 'user-switch',
    color: '#14b8a6',
    category: 'assignment',
    priority: 'medium'
  },
  TICKET_STATUS_CHANGED: {
    icon: 'refresh',
    color: '#a855f7',
    category: 'status',
    priority: 'low'
  },
  TICKET_PRIORITY_CHANGED: {
    icon: 'alert',
    color: '#f97316',
    category: 'ticket',
    priority: 'high'
  },
  COMMENT_ADDED: {
    icon: 'message',
    color: '#22c55e',
    category: 'comment',
    priority: 'low'
  },
  MENTION: {
    icon: 'at',
    color: '#eab308',
    category: 'mention',
    priority: 'medium'
  },
  TICKET_DUE_SOON: {
    icon: 'clock',
    color: '#ef4444',
    category: 'system',
    priority: 'high'
  },
  TICKET_OVERDUE: {
    icon: 'warning',
    color: '#dc2626',
    category: 'system',
    priority: 'urgent'
  },
  PROJECT_ASSIGNED: {
    icon: 'folder',
    color: '#a855f7',
    category: 'assignment',
    priority: 'medium'
  },
  TICKET_CREATED: {
    icon: 'plus-circle',
    color: '#06b6d4',
    category: 'ticket',
    priority: 'low'
  }
};

/**
 * Create a notification
 * @param {Object} options - Notification options
 * @param {string} options.type - Type of notification (from NOTIFICATION_TYPES)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {number} options.recipientUserId - User ID to receive notification
 * @param {string} options.recipientRole - Role to receive notification
 * @param {number} options.ticketId - Related ticket ID
 * @param {number} options.actorUserId - User who triggered the notification
 * @param {Object} options.metadata - Additional data
 * @param {string} options.actionUrl - URL to navigate when clicked
 */
const createNotification = async (options) => {
  try {
    const config = NOTIFICATION_TYPES[options.type] || {};

    const notification = await Notification.create({
      title: options.title,
      message: options.message,
      type: options.type,
      recipientUserId: options.recipientUserId || null,
      recipientRole: options.recipientRole || null,
      ticketId: options.ticketId || null,
      actorUserId: options.actorUserId || null,
      actionUrl: options.actionUrl || null,
      metadata: options.metadata || null,
      icon: config.icon || 'bell',
      color: config.color || '#6b7280',
      category: config.category || 'system',
      priority: options.priority || config.priority || 'medium',
      isRead: false,
      isDeleted: false
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Notify user about ticket assignment
 */
const notifyTicketAssigned = async (ticket, assignee, actor) => {
  if (!assignee) return;

  return createNotification({
    type: 'TICKET_ASSIGNED',
    title: 'New ticket assigned',
    message: `${actor.fullName || actor.email} assigned ticket #${ticket.id} "${ticket.title}" to you`,
    recipientUserId: assignee.id,
    ticketId: ticket.id,
    actorUserId: actor.id,
    actionUrl: `/tickets/${ticket.id}`,
    metadata: {
      ticketTitle: ticket.title,
      ticketPriority: ticket.priority,
      actorName: actor.fullName || actor.email
    }
  });
};

/**
 * Notify user about ticket reassignment
 */
const notifyTicketReassigned = async (ticket, newAssignee, oldAssignee, actor) => {
  if (!newAssignee) return;

  return createNotification({
    type: 'TICKET_REASSIGNED',
    title: 'Ticket reassigned to you',
    message: `${actor.fullName || actor.email} reassigned ticket #${ticket.id} "${ticket.title}" to you`,
    recipientUserId: newAssignee.id,
    ticketId: ticket.id,
    actorUserId: actor.id,
    actionUrl: `/tickets/${ticket.id}`,
    metadata: {
      ticketTitle: ticket.title,
      oldAssigneeName: oldAssignee ? (oldAssignee.fullName || oldAssignee.email) : 'Unassigned',
      actorName: actor.fullName || actor.email
    }
  });
};

/**
 * Notify user about status change
 */
const notifyStatusChanged = async (ticket, oldStatus, newStatus, actor, assignee) => {
  if (!assignee) return;

  return createNotification({
    type: 'TICKET_STATUS_CHANGED',
    title: 'Ticket status updated',
    message: `${actor.fullName || actor.email} changed ticket #${ticket.id} status from "${oldStatus}" to "${newStatus}"`,
    recipientUserId: assignee.id,
    ticketId: ticket.id,
    actorUserId: actor.id,
    actionUrl: `/tickets/${ticket.id}`,
    metadata: {
      ticketTitle: ticket.title,
      oldStatus,
      newStatus,
      actorName: actor.fullName || actor.email
    }
  });
};

/**
 * Notify user about priority change
 */
const notifyPriorityChanged = async (ticket, oldPriority, newPriority, actor, assignee) => {
  if (!assignee) return;

  const priority = newPriority === 'High' || newPriority === 'Urgent' ? 'high' : 'medium';

  return createNotification({
    type: 'TICKET_PRIORITY_CHANGED',
    title: 'Ticket priority changed',
    message: `${actor.fullName || actor.email} changed ticket #${ticket.id} priority from "${oldPriority}" to "${newPriority}"`,
    recipientUserId: assignee.id,
    ticketId: ticket.id,
    actorUserId: actor.id,
    actionUrl: `/tickets/${ticket.id}`,
    priority,
    metadata: {
      ticketTitle: ticket.title,
      oldPriority,
      newPriority,
      actorName: actor.fullName || actor.email
    }
  });
};

/**
 * Notify user about new comment
 */
const notifyCommentAdded = async (ticket, comment, actor, assignee) => {
  if (!assignee || assignee.id === actor.id) return; // Don't notify if commenting on own ticket

  return createNotification({
    type: 'COMMENT_ADDED',
    title: 'New comment on ticket',
    message: `${actor.fullName || actor.email} commented on ticket #${ticket.id}`,
    recipientUserId: assignee.id,
    ticketId: ticket.id,
    actorUserId: actor.id,
    actionUrl: `/tickets/${ticket.id}`,
    metadata: {
      ticketTitle: ticket.title,
      commentSnippet: comment.content.substring(0, 100),
      actorName: actor.fullName || actor.email
    }
  });
};

/**
 * Notify user about project assignment
 */
const notifyProjectAssigned = async (ticket, project, actor, assignee) => {
  if (!assignee) return;

  return createNotification({
    type: 'PROJECT_ASSIGNED',
    title: 'Ticket moved to project',
    message: `${actor.fullName || actor.email} moved ticket #${ticket.id} to project "${project.name}"`,
    recipientUserId: assignee.id,
    ticketId: ticket.id,
    actorUserId: actor.id,
    actionUrl: `/tickets/${ticket.id}`,
    metadata: {
      ticketTitle: ticket.title,
      projectName: project.name,
      actorName: actor.fullName || actor.email
    }
  });
};

module.exports = {
  createNotification,
  notifyTicketAssigned,
  notifyTicketReassigned,
  notifyStatusChanged,
  notifyPriorityChanged,
  notifyCommentAdded,
  notifyProjectAssigned,
  NOTIFICATION_TYPES
};
