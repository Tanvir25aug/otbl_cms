'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('connection_logs', 'commandStatus', {
      type: Sequelize.ENUM('COMPLETED', 'COMINPROG', 'DISCARDED', 'FAILED'),
      allowNull: true,
      comment: 'COMPLETED = Success, COMINPROG = In Progress, DISCARDED/FAILED = Failed'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('connection_logs', 'commandStatus');
  }
};
