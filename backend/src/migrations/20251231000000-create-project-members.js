'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProjectMembers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('admin', 'member'),
        defaultValue: 'member',
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate memberships
    await queryInterface.addIndex('ProjectMembers', ['projectId', 'userId'], {
      unique: true,
      name: 'unique_project_user'
    });

    // Add index for faster queries
    await queryInterface.addIndex('ProjectMembers', ['userId']);
    await queryInterface.addIndex('ProjectMembers', ['projectId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ProjectMembers');
  }
};
