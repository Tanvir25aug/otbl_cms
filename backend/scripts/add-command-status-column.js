const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function addCommandStatusColumn() {
  try {
    const queryInterface = sequelize.getQueryInterface();

    console.log('Adding commandStatus column to connection_logs table...');

    // For SQLite, we need to handle ENUM differently
    await queryInterface.addColumn('connection_logs', 'commandStatus', {
      type: DataTypes.STRING,
      allowNull: true
    });

    console.log('✓ commandStatus column added successfully');

    // Add migration to SequelizeMeta
    await sequelize.query(
      "INSERT INTO SequelizeMeta (name) VALUES ('20260102000000-add-command-status-to-connection-logs.js')"
    );
    console.log('✓ Migration recorded in SequelizeMeta');

  } catch (error) {
    console.error('Error adding commandStatus column:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addCommandStatusColumn()
  .then(() => {
    console.log('\n✓ Database update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Database update failed:', error);
    process.exit(1);
  });
