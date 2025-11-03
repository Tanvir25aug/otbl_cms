'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('MeterReadings', 'TOTAL_ENERGY', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('MeterReadings', 'TOD1_ENERGY', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('MeterReadings', 'TOD2_ENERGY', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('MeterReadings', 'TOTAL_ENERGY');
    await queryInterface.removeColumn('MeterReadings', 'TOD1_ENERGY');
    await queryInterface.removeColumn('MeterReadings', 'TOD2_ENERGY');
  }
};
