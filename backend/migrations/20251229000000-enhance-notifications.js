'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Notifications table
    await queryInterface.addColumn('Notifications', 'priority', {
      type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      allowNull: true,
    });

    await queryInterface.addColumn('Notifications', 'actionUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Notifications', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('Notifications', 'icon', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Notifications', 'color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Notifications', 'actorUserId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Notifications', 'category', {
      type: Sequelize.ENUM('ticket', 'comment', 'mention', 'system', 'status', 'assignment'),
      defaultValue: 'system',
      allowNull: true,
    });

    await queryInterface.addColumn('Notifications', 'isDeleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('Notifications', 'readAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns if rolling back
    await queryInterface.removeColumn('Notifications', 'priority');
    await queryInterface.removeColumn('Notifications', 'actionUrl');
    await queryInterface.removeColumn('Notifications', 'metadata');
    await queryInterface.removeColumn('Notifications', 'icon');
    await queryInterface.removeColumn('Notifications', 'color');
    await queryInterface.removeColumn('Notifications', 'actorUserId');
    await queryInterface.removeColumn('Notifications', 'category');
    await queryInterface.removeColumn('Notifications', 'isDeleted');
    await queryInterface.removeColumn('Notifications', 'readAt');
  }
};
