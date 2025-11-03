'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TimeLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'ticketId',
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'userId',
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      timeSpent: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'timeSpent',
        comment: 'Time spent in hours'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'description',
        comment: 'Description of work done'
      },
      loggedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'loggedAt',
        comment: 'Timestamp when time was logged'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('TimeLogs', ['ticketId'], {
      name: 'timelogs_ticketid_index'
    });

    await queryInterface.addIndex('TimeLogs', ['userId'], {
      name: 'timelogs_userid_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TimeLogs');
  }
};
