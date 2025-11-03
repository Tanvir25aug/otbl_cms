const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member',
    allowNull: false,
    comment: 'Project-level role: admin can manage members, member can only work on tickets'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ProjectMembers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['projectId', 'userId'],
      name: 'unique_project_user'
    },
    {
      fields: ['userId']
    },
    {
      fields: ['projectId']
    }
  ]
});

module.exports = ProjectMember;
