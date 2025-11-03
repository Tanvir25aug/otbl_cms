'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, modify status column to use ENUM
    await queryInterface.changeColumn('Tickets', 'status', {
      type: Sequelize.ENUM('Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Done', 'Closed'),
      defaultValue: 'Backlog',
      allowNull: true
    });

    // Modify priority column to use ENUM
    await queryInterface.changeColumn('Tickets', 'priority', {
      type: Sequelize.ENUM('Lowest', 'Low', 'Medium', 'High', 'Highest'),
      defaultValue: 'Medium',
      allowNull: true
    });

    // Modify type column to use ENUM
    await queryInterface.changeColumn('Tickets', 'type', {
      type: Sequelize.ENUM('Epic', 'Story', 'Task', 'Bug', 'Subtask', 'Improvement', 'New Feature'),
      defaultValue: 'Task',
      allowNull: true
    });

    // Modify severity column to use ENUM
    await queryInterface.changeColumn('Tickets', 'severity', {
      type: Sequelize.ENUM('Blocker', 'Critical', 'Major', 'Minor', 'Trivial'),
      allowNull: true
    });

    // Modify resolution column to use ENUM
    await queryInterface.changeColumn('Tickets', 'resolution', {
      type: Sequelize.ENUM('Unresolved', 'Fixed', 'Won\'t Fix', 'Duplicate', 'Cannot Reproduce', 'Done'),
      defaultValue: 'Unresolved',
      allowNull: true
    });

    // Add new columns to Tickets table
    await queryInterface.addColumn('Tickets', 'sprintId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Sprints',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Tickets', 'epicId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Tickets',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Tickets', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'resolvedDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'resolutionComment', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'storyPoints', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'originalEstimate', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'remainingEstimate', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'timeSpent', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'labels', {
      type: Sequelize.JSON,
      defaultValue: [],
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'components', {
      type: Sequelize.JSON,
      defaultValue: [],
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'affectedVersions', {
      type: Sequelize.JSON,
      defaultValue: [],
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'fixVersions', {
      type: Sequelize.JSON,
      defaultValue: [],
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'environment', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'watchers', {
      type: Sequelize.JSON,
      defaultValue: [],
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'isFlagged', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'isArchived', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });

    // Create Sprints table
    await queryInterface.createTable('Sprints', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      goal: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('Future', 'Active', 'Closed'),
        defaultValue: 'Future',
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      completedPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      totalPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create TicketHistories table
    await queryInterface.createTable('TicketHistories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      field: {
        type: Sequelize.STRING,
        allowNull: true
      },
      oldValue: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      newValue: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create TicketAttachments table
    await queryInterface.createTable('TicketAttachments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      originalName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns from Tickets
    await queryInterface.removeColumn('Tickets', 'sprintId');
    await queryInterface.removeColumn('Tickets', 'epicId');
    await queryInterface.removeColumn('Tickets', 'startDate');
    await queryInterface.removeColumn('Tickets', 'resolvedDate');
    await queryInterface.removeColumn('Tickets', 'resolutionComment');
    await queryInterface.removeColumn('Tickets', 'storyPoints');
    await queryInterface.removeColumn('Tickets', 'originalEstimate');
    await queryInterface.removeColumn('Tickets', 'remainingEstimate');
    await queryInterface.removeColumn('Tickets', 'timeSpent');
    await queryInterface.removeColumn('Tickets', 'labels');
    await queryInterface.removeColumn('Tickets', 'components');
    await queryInterface.removeColumn('Tickets', 'affectedVersions');
    await queryInterface.removeColumn('Tickets', 'fixVersions');
    await queryInterface.removeColumn('Tickets', 'environment');
    await queryInterface.removeColumn('Tickets', 'watchers');
    await queryInterface.removeColumn('Tickets', 'isFlagged');
    await queryInterface.removeColumn('Tickets', 'isArchived');

    // Drop new tables
    await queryInterface.dropTable('TicketAttachments');
    await queryInterface.dropTable('TicketHistories');
    await queryInterface.dropTable('Sprints');

    // Revert columns to STRING type (rollback ENUM changes)
    await queryInterface.changeColumn('Tickets', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'Open',
      allowNull: true
    });

    await queryInterface.changeColumn('Tickets', 'priority', {
      type: Sequelize.STRING,
      defaultValue: 'Medium',
      allowNull: true
    });

    await queryInterface.changeColumn('Tickets', 'type', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Tickets', 'severity', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Tickets', 'resolution', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
