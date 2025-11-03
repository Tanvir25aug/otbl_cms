const fs = require('fs');
const csvParserService = require('./src/services/csvParserService');
const readingProcessorService = require('./src/services/readingProcessorService');

async function testCSVParser() {
    try {
        console.log('🧪 Testing CSV Parser\n');

        // Read test CSV file
        const fileBuffer = fs.readFileSync('./test-data.csv');
        console.log('✅ Test file loaded\n');

        // Parse CSV
        console.log('📊 Parsing CSV...');
        const parsedData = await csvParserService.parseMeterReadings(fileBuffer);

        console.log('\n📋 Parse Results:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Meter Number: ${parsedData.meterNo}`);
        console.log(`Total Valid Readings: ${parsedData.totalReadings}`);
        console.log(`Skipped Null Readings: ${parsedData.skippedNullReadings}`);

        console.log('\n📈 Sample Readings (first 5):');
        parsedData.readings.slice(0, 5).forEach((reading, index) => {
            console.log(`${index + 1}. Date: ${reading.reading_date}, Energy: ${reading.total_energy} kWh`);
        });

        // Test saving to database
        console.log('\n💾 Testing database save...');
        const processResult = await readingProcessorService.processAndSaveReadings(
            parsedData.meterNo,
            parsedData.readings
        );

        console.log('\n✅ Database Save Results:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Total Extracted: ${processResult.totalExtracted}`);
        console.log(`New Saved: ${processResult.newSaved}`);
        console.log(`Duplicates Skipped: ${processResult.duplicatesSkipped}`);

        if (processResult.newSaved > 0) {
            console.log('\n📊 Saved Readings:');
            processResult.savedReadings.forEach((reading, index) => {
                console.log(`${index + 1}. ${reading.date} - ${reading.total_energy} kWh`);
            });
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        process.exit(0);
    }
}

testCSVParser();
