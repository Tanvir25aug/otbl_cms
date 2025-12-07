const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function createConnectionLogsTable() {
  try {
    const queryInterface = sequelize.getQueryInterface();

    // Check if table exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('connection_logs')) {
      console.log('✓ connection_logs table already exists');
      return;
    }

    console.log('Creating connection_logs table...');

    await queryInterface.createTable('connection_logs', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      eventType: {
        type: DataTypes.ENUM('RC', 'DC'),
        allowNull: false
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      socketId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('connection_logs', ['userId']);
    await queryInterface.addIndex('connection_logs', ['eventType']);
    await queryInterface.addIndex('connection_logs', ['timestamp']);

    console.log('✓ connection_logs table created successfully');

    // Add migration to SequelizeMeta
    await sequelize.query(
      "INSERT INTO SequelizeMeta (name) VALUES ('20260101000000-create-connection-logs.js')"
    );
    console.log('✓ Migration recorded in SequelizeMeta');

  } catch (error) {
    console.error('Error creating connection_logs table:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createConnectionLogsTable()
  .then(() => {
    console.log('\n✓ Database setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Database setup failed:', error);
    process.exit(1);
  });
