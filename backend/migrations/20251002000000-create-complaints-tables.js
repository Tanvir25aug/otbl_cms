'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ComplaintCategories table
    await queryInterface.createTable('ComplaintCategories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create Complaints table
    await queryInterface.createTable('Complaints', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customerId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      meterNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      issueDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Open', 'In Progress', 'Close'),
        defaultValue: 'Open',
      },
      customerInfo: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      agentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      complaintCategoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ComplaintCategories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Complaints');
    await queryInterface.dropTable('ComplaintCategories');
  },
};
