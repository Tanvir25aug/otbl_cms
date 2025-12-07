const sequelize = require('../src/config/database');
const ConnectionLog = require('../src/models/ConnectionLog');

async function updateExistingCommandStatus() {
  try {
    console.log('Updating existing connection logs with commandStatus...');

    // Get all connection logs without commandStatus
    const logs = await ConnectionLog.findAll({
      where: {
        commandStatus: null
      }
    });

    console.log(`Found ${logs.length} records to update`);

    let updated = 0;
    let skipped = 0;

    for (const log of logs) {
      try {
        let normalizedStatus = null;

        // Try to get command status from metadata
        if (log.metadata && log.metadata.command_status) {
          const commandStatus = log.metadata.command_status.toString().trim().toUpperCase();

          if (commandStatus === 'COMPLETED') {
            normalizedStatus = 'COMPLETED';
          } else if (commandStatus === 'COMINPROG' || commandStatus === 'IN_PROGRESS' || commandStatus === 'INPROGRESS') {
            normalizedStatus = 'COMINPROG';
          } else if (commandStatus === 'DISCARDED' || commandStatus === 'FAILED') {
            normalizedStatus = 'DISCARDED';
          }
        }

        if (normalizedStatus) {
          await log.update({ commandStatus: normalizedStatus });
          updated++;
          if (updated % 100 === 0) {
            console.log(`Updated ${updated} records...`);
          }
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error updating log ${log.id}:`, error.message);
        skipped++;
      }
    }

    console.log('\n✓ Update completed!');
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Skipped: ${skipped}`);

  } catch (error) {
    console.error('Error updating command status:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

updateExistingCommandStatus()
  .then(() => {
    console.log('\n✓ Database update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Database update failed:', error);
    process.exit(1);
  });
