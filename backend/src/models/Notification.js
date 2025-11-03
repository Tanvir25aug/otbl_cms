const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recipientUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  recipientRole: {
    type: DataTypes.ENUM('Super Admin', 'Admin', 'Manager', 'Agent', 'User', 'All'),
    allowNull: true,
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: true,
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  actorUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('ticket', 'comment', 'mention', 'system', 'status', 'assignment'),
    defaultValue: 'system',
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
});

module.exports = Notification;


