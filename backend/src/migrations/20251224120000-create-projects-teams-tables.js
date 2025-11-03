'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Projects table
    await queryInterface.createTable('Projects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Completed', 'On Hold', 'Cancelled'),
        defaultValue: 'Active',
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Update Teams table (if exists, otherwise create)
    const tables = await queryInterface.showAllTables();

    if (tables.includes('Teams')) {
      // Add new columns to existing Teams table
      await queryInterface.addColumn('Teams', 'projectId', {
        type: Sequelize.INTEGER,
        allowNull: true, // Allow null initially for existing records
        references: {
          model: 'Projects',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

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

      await queryInterface.addColumn('Teams', 'status', {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
        allowNull: false,
      });

      // Check if createdAt and updatedAt exist
      const teamTableInfo = await queryInterface.describeTable('Teams');
      if (!teamTableInfo.createdAt) {
        await queryInterface.addColumn('Teams', 'createdAt', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }
      if (!teamTableInfo.updatedAt) {
        await queryInterface.addColumn('Teams', 'updatedAt', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }
    } else {
      // Create Teams table from scratch
      await queryInterface.createTable('Teams', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        projectId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Projects',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        leaderId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        status: {
          type: Sequelize.ENUM('Active', 'Inactive'),
          defaultValue: 'Active',
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    // Create TeamMembers table
    await queryInterface.createTable('TeamMembers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Role within the team',
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint for teamId + userId
    await queryInterface.addConstraint('TeamMembers', {
      fields: ['teamId', 'userId'],
      type: 'unique',
      name: 'unique_team_user',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('TeamMembers');

    // Remove added columns from Teams table if it existed before
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Teams')) {
      await queryInterface.removeColumn('Teams', 'status');
      await queryInterface.removeColumn('Teams', 'leaderId');
      await queryInterface.removeColumn('Teams', 'projectId');
    }

    await queryInterface.dropTable('Projects');
  },
};
