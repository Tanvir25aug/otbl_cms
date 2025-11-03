const sequelize = require('./src/config/database');

async function fixMeterReadingsTable() {
  try {
    console.log('Starting MeterReadings table fix...');

    // Disable foreign keys
    await sequelize.query('PRAGMA foreign_keys = OFF;');

    // Rename old table
    await sequelize.query('ALTER TABLE MeterReadings RENAME TO MeterReadings_old;');
    console.log('Renamed old table to MeterReadings_old');

    // Create new table with correct schema
    await sequelize.query(`
      CREATE TABLE MeterReadings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meter_no VARCHAR(255) NOT NULL,
        value_kwh FLOAT,
        TOTAL_ENERGY FLOAT,
        TOD1_ENERGY FLOAT,
        TOD2_ENERGY FLOAT,
        reading_date DATETIME NOT NULL,
        is_estimated TINYINT(1) NOT NULL DEFAULT 0,
        estimation_method VARCHAR(255),
        estimated_at DATETIME,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);
    console.log('Created new MeterReadings table');

    // Copy data from old table to new table
    await sequelize.query(`
      INSERT INTO MeterReadings (
        id, meter_no, value_kwh, TOTAL_ENERGY, TOD1_ENERGY, TOD2_ENERGY,
        reading_date, is_estimated, estimation_method, estimated_at,
        createdAt, updatedAt
      )
      SELECT
        id, meter_no, value_kwh, TOTAL_ENERGY, TOD1_ENERGY, TOD2_ENERGY,
        reading_date, is_estimated, estimation_method, estimated_at,
        createdAt, updatedAt
      FROM MeterReadings_old;
    `);
    console.log('Copied data from old table');

    // Drop old table
    await sequelize.query('DROP TABLE MeterReadings_old;');
    console.log('Dropped old table');

    // Recreate indexes
    await sequelize.query('CREATE INDEX meter_readings_meter_no ON MeterReadings (meter_no);');
    await sequelize.query('CREATE INDEX meter_readings_is_estimated ON MeterReadings (is_estimated);');
    console.log('Recreated indexes');

    // Re-enable foreign keys
    await sequelize.query('PRAGMA foreign_keys = ON;');

    console.log('✅ MeterReadings table fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing MeterReadings table:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixMeterReadingsTable();
