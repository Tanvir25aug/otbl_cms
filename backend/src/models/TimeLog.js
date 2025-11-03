const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimeLog = sequelize.define('TimeLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tickets',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  timeSpent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // Time in hours (e.g., 1.5 for 1 hour 30 minutes)
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    // What was done during this time
  },
  loggedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'TimeLogs',
  timestamps: true,
});

module.exports = TimeLog;
