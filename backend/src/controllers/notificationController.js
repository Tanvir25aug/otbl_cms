const { Notification, User } = require('../models');
const { Op } = require('sequelize');

exports.getMyNotifications = async (req, res) => {
  try {
    const orConditions = [];
    if (req.user && req.user.id) {
      orConditions.push({ recipientUserId: req.user.id });
    }
    if (req.user && req.user.role) {
      orConditions.push({ recipientRole: req.user.role });
      orConditions.push({ recipientRole: 'All' });
    }

    const where = {
      isDeleted: false,
      ...(orConditions.length > 0 ? { [Op.or]: orConditions } : {})
    };

    // Apply filters from query params
    if (req.query.isRead !== undefined) {
      where.isRead = req.query.isRead === 'true';
    }
    if (req.query.category) {
      where.category = req.query.category;
    }
    if (req.query.priority) {
      where.priority = req.query.priority;
    }
    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { message: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        { model: User, as: 'actor', attributes: ['id', 'email', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Error getting notifications', error });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const orConditions = [];
    if (req.user && req.user.id) {
      orConditions.push({ recipientUserId: req.user.id });
    }
    if (req.user && req.user.role) {
      orConditions.push({ recipientRole: req.user.role });
      orConditions.push({ recipientRole: 'All' });
    }

    const where = {
      isRead: false,
      isDeleted: false,
      ...(orConditions.length > 0 ? { [Op.or]: orConditions } : {})
    };

    const count = await Notification.count({ where });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting unread count', error });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (
      notification.recipientUserId && notification.recipientUserId !== req.user.id ||
      notification.recipientRole && notification.recipientRole !== req.user.role && notification.recipientRole !== 'All'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    res.status(200).json({ message: 'Marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const orConditions = [];
    if (req.user && req.user.id) {
      orConditions.push({ recipientUserId: req.user.id });
    }
    if (req.user && req.user.role) {
      orConditions.push({ recipientRole: req.user.role });
      orConditions.push({ recipientRole: 'All' });
    }

    const where = {
      isRead: false,
      isDeleted: false,
      ...(orConditions.length > 0 ? { [Op.or]: orConditions } : {})
    };

    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all as read', error });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (
      notification.recipientUserId && notification.recipientUserId !== req.user.id ||
      notification.recipientRole && notification.recipientRole !== req.user.role && notification.recipientRole !== 'All'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notification.isDeleted = true;
    await notification.save();
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error });
  }
};

exports.clearAll = async (req, res) => {
  try {
    const orConditions = [];
    if (req.user && req.user.id) {
      orConditions.push({ recipientUserId: req.user.id });
    }
    if (req.user && req.user.role) {
      orConditions.push({ recipientRole: req.user.role });
      orConditions.push({ recipientRole: 'All' });
    }

    const where = {
      isRead: true,
      isDeleted: false,
      ...(orConditions.length > 0 ? { [Op.or]: orConditions } : {})
    };

    await Notification.update(
      { isDeleted: true },
      { where }
    );

    res.status(200).json({ message: 'All read notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications', error });
  }
};


