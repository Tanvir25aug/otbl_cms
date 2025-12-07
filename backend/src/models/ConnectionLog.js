const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConnectionLog = sequelize.define('ConnectionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  eventType: {
    type: DataTypes.ENUM('RC', 'DC'),
    allowNull: false,
    comment: 'RC = Reconnect/Connect, DC = Disconnect'
  },
  commandStatus: {
    type: DataTypes.ENUM('COMPLETED', 'COMINPROG', 'DISCARDED', 'FAILED'),
    allowNull: true,
    comment: 'COMPLETED = Success, COMINPROG = In Progress, DISCARDED/FAILED = Failed'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  socketId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds (for DC events)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'connection_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['eventType']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = ConnectionLog;
