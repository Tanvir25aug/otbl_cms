'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Complaints', 'priority', {
      type: Sequelize.ENUM('Low', 'Medium', 'High', 'Critical'),
      defaultValue: 'Medium',
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Complaints', 'priority');
  }
};
