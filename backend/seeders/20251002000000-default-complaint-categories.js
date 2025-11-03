'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      { name: 'Billing Issue', createdAt: new Date(), updatedAt: new Date() },
      { name: 'No Power Supply', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Meter Not Working', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Low Voltage', createdAt: new Date(), updatedAt: new Date() },
      { name: 'High Bill Amount', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Wrong Meter Reading', createdAt: new Date(), updatedAt: new Date() },
      { name: 'New Connection Request', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Name Change Request', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Meter Replacement Request', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Wire/Pole Issue', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Load Extension', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Other', createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('ComplaintCategories', categories, {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ComplaintCategories', null, {});
  }
};
