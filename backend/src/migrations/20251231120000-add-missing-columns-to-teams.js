'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const teamTableInfo = await queryInterface.describeTable('Teams');

    // Add projectId column if it doesn't exist
    if (!teamTableInfo.projectId) {
      await queryInterface.addColumn('Teams', 'projectId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Projects',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }

    // Add leaderId column if it doesn't exist
    if (!teamTableInfo.leaderId) {
      await queryInterface.addColumn('Teams', 'leaderId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    // Add status column if it doesn't exist
    if (!teamTableInfo.status) {
      await queryInterface.addColumn('Teams', 'status', {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
        allowNull: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const teamTableInfo = await queryInterface.describeTable('Teams');

    if (teamTableInfo.status) {
      await queryInterface.removeColumn('Teams', 'status');
    }
    if (teamTableInfo.leaderId) {
      await queryInterface.removeColumn('Teams', 'leaderId');
    }
    if (teamTableInfo.projectId) {
      await queryInterface.removeColumn('Teams', 'projectId');
    }
  },
};
