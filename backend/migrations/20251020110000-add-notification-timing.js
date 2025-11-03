'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TelegramNotificationSettings', 'notificationTiming', {
      type: Sequelize.ENUM('open', 'close', 'both'),
      defaultValue: 'both',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TelegramNotificationSettings', 'notificationTiming');
  }
};
