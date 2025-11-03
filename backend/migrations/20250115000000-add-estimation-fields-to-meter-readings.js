'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('MeterReadings', 'is_estimated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('MeterReadings', 'estimation_method', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('MeterReadings', 'estimated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('MeterReadings', ['is_estimated']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('MeterReadings', ['is_estimated']);
    await queryInterface.removeColumn('MeterReadings', 'estimated_at');
    await queryInterface.removeColumn('MeterReadings', 'estimation_method');
    await queryInterface.removeColumn('MeterReadings', 'is_estimated');
  }
};
