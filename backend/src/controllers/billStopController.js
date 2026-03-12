const csv = require('csv-parser');
const { Readable } = require('stream');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const MeterReplacement = require('../models/MeterReplacement');
const MdmRead = require('../models/MdmRead');
const MeterReading = require('../models/MeterReading');
const Customer = require('../models/Customer');
const LastBillDate = require('../models/LastBillDate');
const { saveSnapshot } = require('./billStopSnapshotController');


const uploadAndAnalyze = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const analysisResults = await performBillStopAnalysis(results);
        res.status(200).json(analysisResults);
      } catch (error) {
        console.error('Error during bill stop analysis:', error);
        res.status(500).send('An error occurred during analysis.');
      }
    });
};

async function performBillStopAnalysis(customerData) {
  const finalResults = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  for (const row of customerData) {
    const { CUSTOMER_NUM, METER_NO } = row;
    
    const lastBillDateData = await LastBillDate.findOne({ where: { CUSTOMER_NUM } });
    const lastBillDate = lastBillDateData ? lastBillDateData.LAST_BILL_DATE : null;

    

    const lastBillDt = new Date(lastBillDate);

    if (lastBillDt.getMonth() === currentMonth && lastBillDt.getFullYear() === currentYear) {
      const mdmReads = await MdmRead.findAll({
        where: { METER_NO: METER_NO },
        order: [['MSRMT_DTTM', 'ASC']]
      });
      finalResults.push({
        customerNumber: CUSTOMER_NUM,
        meterNumber: METER_NO,
        status: 'BILL_START',
        lastBillDate: lastBillDate,
        mdmReads: mdmReads
      });
    } else {
      try {
        const customer = await Customer.findOne({ where: { CUSTOMER_NUM } });
        const tariff = customer ? customer.TARIFF : null;

        const analysis = await analyzeCustomerBillStop(
          CUSTOMER_NUM,
          METER_NO,
          tariff,
          lastBillDate,
          currentDate
        );
        finalResults.push(analysis);
      } catch (error) {
        console.error(`Error analyzing customer ${CUSTOMER_NUM}:`, error);
        finalResults.push({
          customerNumber: CUSTOMER_NUM,
          meterNumber: METER_NO,
          error: error.message,
          status: 'ERROR'
        });
      }
    }
  }

  return finalResults;
}

async function analyzeCustomerBillStop(customerNum, meterNo, tariff, lastBillDate, currentDate) {
  const result = {
    customerNumber: customerNum,
    meterNumber: meterNo,
    tariff: tariff,
    lastBillDate: lastBillDate,
    currentDate: currentDate,
    billStopIssues: [],
    estimatedReadings: [],
    status: 'ANALYZED'
  };

  // Check if meter has replacement history
  const replacementHistory = await MeterReplacement.findOne({
    where: { oldMeterNumber: meterNo }
  });

  if (replacementHistory) {
    // Handle meter replacement scenario
    await handleMeterReplacementScenario(result, replacementHistory, currentDate);
  } else {
    // Handle no replacement scenario
    await handleNoReplacementScenario(result, meterNo, currentDate);
  }

  return result;
}

async function handleMeterReplacementScenario(result, replacement, currentDate) {
  const replaceDate = new Date(replacement.replaceDate);
  const lastBill = result.lastBillDate ? new Date(result.lastBillDate) : null;
  
  result.replacementInfo = {
    oldMeterNumber: replacement.oldMeterNumber,
    newMeterNumber: replacement.replaceMeterNumber,
    installDate: replacement.installDate,
    replaceDate: replacement.replaceDate
  };

  const customer = await Customer.findOne({ where: { CUSTOMER_NUM: result.customerNumber } });

  // Check if Replace Date >= Last Bill Date
  if (lastBill && replaceDate >= lastBill) {
    // No need to check old meter's billing profile
    result.oldMeterStatus = 'NO_CHECK_NEEDED';
    result.oldMeterReason = 'Replace date is after or equal to last bill date';
  } else {
    // Calculate days between Last Bill Date and Replace Date
    const startDate = lastBill || new Date(replacement.installDate);
    const daysBetween = Math.ceil((replaceDate - startDate) / (1000 * 60 * 60 * 24));
    
    result.oldMeterStatus = 'ANALYSIS_REQUIRED';
    result.oldMeterDaysBetween = daysBetween;
    
    // Analyze old meter for missing reads
    await analyzeMeterReadings(
      replacement.oldMeterNumber,
      startDate,
      replaceDate,
      result.tariff,
      result,
      'OLD_METER',
      customer
    );
  }

  // Always analyze new meter from replace date to current date
  await analyzeMeterReadings(
    replacement.replaceMeterNumber,
    replaceDate,
    currentDate,
    result.tariff,
    result,
    'NEW_METER',
    null // For new meter, the install date is the replaceDate
  );
}

async function handleNoReplacementScenario(result, meterNo, currentDate) {
  const customer = await Customer.findOne({ 
    where: { CUSTOMER_NUM: result.customerNumber } 
  });

  if (!customer) {
    result.status = 'ERROR';
    result.error = 'Customer not found in database';
    return;
  }

  const customerTariff = customer.TARIFF || result.tariff;
  result.tariff = customerTariff;

  let startDate;
  let analysisPeriod;

  if (result.lastBillDate) {
    // If last bill date exists, check from last bill date to current month
    startDate = new Date(result.lastBillDate);
    analysisPeriod = 'LAST_BILL_TO_CURRENT';
  } else {
    // If last bill date is null, check from next month of installation date
    const installDate = new Date(customer.CONN_DATE);
    startDate = new Date(installDate.getFullYear(), installDate.getMonth() + 1, 1);
    analysisPeriod = 'INSTALL_NEXT_MONTH_TO_CURRENT';
  }

  result.analysisPeriod = analysisPeriod;
  result.analysisStartDate = startDate;

  await analyzeMeterReadings(
    meterNo,
    startDate,
    currentDate,
    customerTariff,
    result,
    'CURRENT_METER',
    customer
  );
}

async function analyzeMeterReadings(meterNo, startDate, endDate, tariff, result, meterType, customer) {
  // Get MDM reads for the period
  const mdmReads = await MdmRead.findAll({
    where: {
      METER_NO: meterNo,
      MSRMT_DTTM: { [Op.between]: [startDate, endDate] }
    },
    order: [['MSRMT_DTTM', 'ASC']]
  });

  // Get billing profile data for the period
  const billingReadings = await MeterReading.findAll({
    where: {
      meter_no: meterNo,
      reading_date: { [Op.between]: [startDate, endDate] }
    },
    order: [['reading_date', 'ASC']]
  });

  // Determine reading types based on tariff
  const readingTypes = tariff === 'LT-A' ? ['kWh Daily'] : ['kWh Daily', 'kWh Daily TOD1', 'kWh Daily TOD2'];

  // Generate monthly dates from start to end
  const monthlyDates = generateMonthlyDates(startDate, endDate);
  
  const meterAnalysis = {
    meterNo: meterNo,
    meterType: meterType,
    startDate: startDate,
    endDate: endDate,
    tariff: tariff,
    monthlyReadings: [],
    missingReadings: [],
    billStopIssues: []
  };

  // Check for Initial Read (Installation Date Read)
  const installDate = customer ? new Date(customer.CONN_DATE) : (meterType === 'NEW_METER' ? startDate : null);
  if (installDate) {
    const initialRead = mdmReads.find(r => new Date(r.MSRMT_DTTM).toDateString() === installDate.toDateString());
    if (!initialRead) {
      meterAnalysis.billStopIssues.push({
        type: 'INITIAL_READ_MISSING',
        description: `Initial Read missing for meter ${meterNo} on installation date ${installDate.toDateString()}.`,
        severity: 'HIGH'
      });
      meterAnalysis.monthlyReadings.push({
        date: installDate,
        readingType: 'Initial Read',
        value: null,
        source: 'SYSTEM',
        remark: 'Initial Read on Connection Date'
      });
    } else {
      meterAnalysis.monthlyReadings.push({
        date: installDate,
        readingType: 'Initial Read',
        value: initialRead.READING_VAL,
        source: 'MDM_READS',
        remark: 'Initial Read on Connection Date'
      });
    }
  }


  // Analyze each month
  for (const monthDate of monthlyDates) {
    for (const readingType of readingTypes) {
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      
      // Check MDM reads first
      let mdmReading = mdmReads.find(r => {
        const readingDate = new Date(r.MSRMT_DTTM);
        return `${readingDate.getFullYear()}-${readingDate.getMonth()}` === monthKey && 
               r.READING_TYPE === readingType;
      });

      let reading = null;
      let billStopIssue = null;

      if (mdmReading) {
        if (mdmReading.REMARKS === 'OK') {
          // Valid MDM reading
          reading = {
            date: new Date(mdmReading.MSRMT_DTTM),
            readingType: readingType,
            value: mdmReading.READING_VAL,
            source: 'MDM_READS',
            remark: 'Valid MDM reading'
          };
        } else if (mdmReading.REMARKS === 'Missing Data') {
          // Try to get from billing profile (only for kWh Daily)
          if (readingType === 'kWh Daily') {
            const billingReading = billingReadings.find(r => {
              const readingDate = new Date(r.reading_date);
              return `${readingDate.getFullYear()}-${readingDate.getMonth()}` === monthKey;
            });

            if (billingReading) {
              reading = {
                date: new Date(billingReading.reading_date),
                readingType: readingType,
                value: billingReading.value_kwh,
                source: 'BILLING_PROFILE',
                remark: 'Retrieved from billing profile - needs to be uploaded to MDM'
              };
              
              // This is a bill stop issue - MDM missing but found in billing
              billStopIssue = {
                type: 'MDM_MISSING_BILLING_AVAILABLE',
                description: `${readingType} missing in MDM but available in billing profile for ${monthDate.toLocaleDateString()}. Please upload to MDM.`,
                severity: 'MEDIUM',
                date: monthDate,
                readingType: readingType
              };
            } else {
              // Mark as missing - no data in either source
              reading = {
                date: monthDate,
                readingType: readingType,
                value: null,
                source: 'MISSING',
                remark: 'Data missing from both MDM and billing profile'
              };
              
              billStopIssue = {
                type: 'COMPLETELY_MISSING',
                description: `${readingType} completely missing for ${monthDate.toLocaleDateString()} - not available in MDM or billing profile`,
                severity: 'HIGH',
                date: monthDate,
                readingType: readingType
              };
            }
          } else {
            // For TOD1 and TOD2, we can't get from billing profile
            reading = {
              date: monthDate,
              readingType: readingType,
              value: null,
              source: 'MISSING',
              remark: `${readingType} missing in MDM - not available in billing profile`
            };
            
            billStopIssue = {
              type: 'TOD_READING_MISSING',
              description: `${readingType} missing in MDM for ${monthDate.toLocaleDateString()}. TOD readings are not available in billing profile.`,
              severity: 'HIGH',
              date: monthDate,
              readingType: readingType
            };
          }
        }
      } else {
        // No MDM reading - check billing profile (only for kWh Daily)
        if (readingType === 'kWh Daily') {
          const billingReading = billingReadings.find(r => {
            const readingDate = new Date(r.reading_date);
            return `${readingDate.getFullYear()}-${readingDate.getMonth()}` === monthKey;
          });

          if (billingReading) {
            reading = {
              date: new Date(billingReading.reading_date),
              readingType: readingType,
              value: billingReading.value_kwh,
              source: 'BILLING_PROFILE',
              remark: 'From billing profile (no MDM data) - needs to be uploaded to MDM'
            };
            
            // This is a bill stop issue - MDM missing but found in billing
            billStopIssue = {
              type: 'MDM_MISSING_BILLING_AVAILABLE',
              description: `${readingType} missing in MDM but available in billing profile for ${monthDate.toLocaleDateString()}. Please upload to MDM.`,
              severity: 'MEDIUM',
              date: monthDate,
              readingType: readingType
            };
          } else {
            // Mark as missing - no data in either source
            reading = {
              date: monthDate,
              readingType: readingType,
              value: null,
              source: 'MISSING',
              remark: 'No data available from MDM or billing profile'
            };
            
            billStopIssue = {
              type: 'COMPLETELY_MISSING',
              description: `${readingType} completely missing for ${monthDate.toLocaleDateString()} - not available in MDM or billing profile`,
              severity: 'HIGH',
              date: monthDate,
              readingType: readingType
            };
          }
        } else {
          // For TOD1 and TOD2, we can't get from billing profile
          reading = {
            date: monthDate,
            readingType: readingType,
            value: null,
            source: 'MISSING',
            remark: `${readingType} missing in MDM - not available in billing profile`
          };
          
          billStopIssue = {
            type: 'TOD_READING_MISSING',
            description: `${readingType} missing in MDM for ${monthDate.toLocaleDateString()}. TOD readings are not available in billing profile.`,
            severity: 'HIGH',
            date: monthDate,
            readingType: readingType
          };
        }
      }

      if (reading) {
        meterAnalysis.monthlyReadings.push(reading);
      }
      
      if (billStopIssue) {
        meterAnalysis.billStopIssues.push(billStopIssue);
        meterAnalysis.missingReadings.push(reading);
      }
    }
  }

  // Add meter analysis to result
  if (meterType === 'OLD_METER') {
    result.oldMeterAnalysis = meterAnalysis;
  } else if (meterType === 'NEW_METER') {
    result.newMeterAnalysis = meterAnalysis;
  } else {
    result.currentMeterAnalysis = meterAnalysis;
  }

  // Check for bill stop issues
  if (meterAnalysis.billStopIssues.length > 0) {
    result.billStopIssues.push({
      meterNo: meterNo,
      meterType: meterType,
      missingReadings: meterAnalysis.missingReadings.length,
      issues: meterAnalysis.billStopIssues.map(issue => ({
        type: issue.type,
        description: issue.description,
        severity: issue.severity,
        date: issue.date,
        readingType: issue.readingType
      }))
    });
  }
}



function generateMonthlyDates(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  current.setDate(1); // Start from first day of month
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  
  return dates;
}

// Add a new endpoint for getting bill stop analysis without file upload
const getBillStopAnalysis = async (req, res) => {
  try {
    const { customerNum, meterNo } = req.query;
    
    if (!customerNum || !meterNo) {
      return res.status(400).json({ error: 'Customer number and meter number are required' });
    }

    const customer = await Customer.findOne({ where: { CUSTOMER_NUM: customerNum } });
    const tariff = customer ? customer.TARIFF : null;

    const lastBillDateData = await LastBillDate.findOne({ where: { CUSTOMER_NUM: customerNum } });
    const lastBillDate = lastBillDateData ? lastBillDateData.LAST_BILL_DATE : null;

    if (!lastBillDate) {
      return res.status(200).json({
        customerNumber: customerNum,
        meterNumber: meterNo,
        status: 'BILL_NOT_STARTED',
        error: 'Last bill date not found in database.'
      });
    }

    const currentDate = new Date();
    const analysis = await analyzeCustomerBillStop(
      customerNum, 
      meterNo, 
      tariff, 
      lastBillDate,
      currentDate
    );

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error in bill stop analysis:', error);
    res.status(500).json({ error: 'An error occurred during analysis' });
  }
};

async function computeBillStopSummary() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

  // Last 3 months window (including current month)
  const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);

  const batchSize = 2000;
  let offset = 0;
  let totalBillStop = 0;
  let withBillingProfileData = 0;
  let withoutBillingProfileData = 0;
  let installedThisMonthNoBill = 0;
  let completeCoverage = 0;
  let partialCoverage = 0;
  let noCoverage = 0;

  while (true) {
    const customers = await Customer.findAll({
      attributes: ['CUSTOMER_NUM', 'METER_NO', 'CONN_DATE'],
      order: [['CUSTOMER_NUM', 'ASC']],
      limit: batchSize,
      offset
    });
    if (customers.length === 0) break;

    const customerNums = customers.map(c => c.CUSTOMER_NUM);
    const meterNos = customers.map(c => c.METER_NO).filter(Boolean);

    const lbdRows = await LastBillDate.findAll({ where: { CUSTOMER_NUM: { [Op.in]: customerNums } } });
    const lbdMap = new Map(lbdRows.map(r => [r.CUSTOMER_NUM, r.LAST_BILL_DATE]));

    const currentMonthReads = meterNos.length > 0 ? await MeterReading.findAll({
      where: {
        meter_no: { [Op.in]: meterNos },
        reading_date: { [Op.gte]: firstDayOfMonth, [Op.lt]: firstDayOfNextMonth }
      },
      attributes: ['meter_no'],
      group: ['meter_no']
    }) : [];
    const currentMonthReadSet = new Set(currentMonthReads.map(r => r.meter_no));

    // Fetch last 3 months readings for coverage classification
    const recentReadRows = meterNos.length > 0 ? await MeterReading.findAll({
      where: {
        meter_no: { [Op.in]: meterNos },
        reading_date: { [Op.gte]: threeMonthsAgo, [Op.lt]: firstDayOfNextMonth }
      },
      attributes: ['meter_no', [sequelize.fn('strftime', '%Y-%m', sequelize.col('reading_date')), 'ym']],
      group: ['meter_no', 'ym']
    }) : [];
    const meterToMonths = new Map();
    for (const row of recentReadRows) {
      const meter = row.get('meter_no');
      const ym = row.get('ym');
      if (!meterToMonths.has(meter)) meterToMonths.set(meter, new Set());
      meterToMonths.get(meter).add(ym);
    }

    const expectedMonths = new Set();
    for (let i = 0; i < 3; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      expectedMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    for (const c of customers) {
      const lastBillDate = lbdMap.get(c.CUSTOMER_NUM);
      const isBillStop = !lastBillDate || (new Date(lastBillDate).getMonth() !== currentMonth || new Date(lastBillDate).getFullYear() !== currentYear);
      if (!isBillStop) continue;
      totalBillStop++;

      const conn = c.CONN_DATE ? new Date(c.CONN_DATE) : null;
      if (conn && conn.getMonth() === currentMonth && conn.getFullYear() === currentYear) {
        installedThisMonthNoBill++;
      }

      if (c.METER_NO && currentMonthReadSet.has(c.METER_NO)) {
        withBillingProfileData++;
      } else {
        withoutBillingProfileData++;
      }

      // Coverage classification over last 3 months
      const months = meterToMonths.get(c.METER_NO) || new Set();
      if (months.size === 0) noCoverage++;
      else if (months.size === expectedMonths.size && [...expectedMonths].every(m => months.has(m))) completeCoverage++;
      else partialCoverage++;
    }

    offset += customers.length;
  }

  return {
    totalBillStop,
    withBillingProfileData,
    withoutBillingProfileData,
    completeCoverage,
    partialCoverage,
    noCoverage,
    installedThisMonthNoBill
  };
}

const getBillStopReport = async (req, res) => {
  try {
    const summary = await computeBillStopSummary();
    res.status(200).json(summary);

    // After responding, save the full customer list to OTBL_CMS asynchronously
    getBillStopCustomerData()
      .then(customers => saveSnapshot(customers))
      .then(count => console.log(`BillStop snapshot saved: ${count} records to OTBL_CMS`))
      .catch(err => console.error('BillStop snapshot save error (non-fatal):', err.message));
  } catch (error) {
    console.error('Error generating bill stop report:', error);
    res.status(500).json({ error: 'An error occurred while generating the report' });
  }
};



/**
 * Internal function: returns the full bill stop customer array (no req/res).
 * Used both by the HTTP handler and the snapshot auto-save.
 */
async function getBillStopCustomerData() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
  const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);

  const batchSize = 2000;
  let offset = 0;
  const result = [];

  while (true) {
    const customers = await Customer.findAll({
      attributes: ['CUSTOMER_NUM', 'CUSTOMER_NAME', 'ADDRESS', 'MOBILE_NO', 'METER_NO', 'CONN_DATE', 'TARIFF'],
      order: [['CUSTOMER_NUM', 'ASC']],
      limit: batchSize,
      offset
    });
    if (customers.length === 0) break;

    const customerNums = customers.map(c => c.CUSTOMER_NUM);
    const meterNos = customers.map(c => c.METER_NO).filter(Boolean);

    const lbdRows = await LastBillDate.findAll({ where: { CUSTOMER_NUM: { [Op.in]: customerNums } } });
    const lbdMap = new Map(lbdRows.map(r => [r.CUSTOMER_NUM, r.LAST_BILL_DATE]));

    const currentMonthReads = meterNos.length > 0 ? await MeterReading.findAll({
      where: {
        meter_no: { [Op.in]: meterNos },
        reading_date: { [Op.gte]: firstDayOfMonth, [Op.lt]: firstDayOfNextMonth }
      },
      attributes: ['meter_no'],
      group: ['meter_no']
    }) : [];
    const currentMonthReadSet = new Set(currentMonthReads.map(r => r.meter_no));

    const recentReadRows = meterNos.length > 0 ? await MeterReading.findAll({
      where: {
        meter_no: { [Op.in]: meterNos },
        reading_date: { [Op.gte]: threeMonthsAgo, [Op.lt]: firstDayOfNextMonth }
      },
      attributes: ['meter_no', [sequelize.fn('strftime', '%Y-%m', sequelize.col('reading_date')), 'ym']],
      group: ['meter_no', 'ym']
    }) : [];
    const meterToMonths = new Map();
    for (const row of recentReadRows) {
      const meter = row.get('meter_no');
      const ym = row.get('ym');
      if (!meterToMonths.has(meter)) meterToMonths.set(meter, new Set());
      meterToMonths.get(meter).add(ym);
    }

    const expectedMonths = new Set();
    for (let i = 0; i < 3; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      expectedMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    for (const c of customers) {
      const lastBillDate = lbdMap.get(c.CUSTOMER_NUM) || null;
      const isBillStop = !lastBillDate || (new Date(lastBillDate).getMonth() !== currentMonth || new Date(lastBillDate).getFullYear() !== currentYear);
      if (!isBillStop) continue;

      const hasCurrentMonthRead = c.METER_NO ? currentMonthReadSet.has(c.METER_NO) : false;
      const months = c.METER_NO ? (meterToMonths.get(c.METER_NO) || new Set()) : new Set();
      let coverage = 'NO_COVERAGE';
      if (months.size === 0) coverage = 'NO_COVERAGE';
      else if (months.size === expectedMonths.size && [...expectedMonths].every(m => months.has(m))) coverage = 'COMPLETE_COVERAGE';
      else coverage = 'PARTIAL_COVERAGE';

      const conn = c.CONN_DATE ? new Date(c.CONN_DATE) : null;
      const installedThisMonthNoBill = !!(conn && conn.getMonth() === currentMonth && conn.getFullYear() === currentYear);

      result.push({
        CUSTOMER_NUM: c.CUSTOMER_NUM,
        CUSTOMER_NAME: c.CUSTOMER_NAME,
        ADDRESS: c.ADDRESS,
        MOBILE_NO: c.MOBILE_NO,
        METER_NO: c.METER_NO,
        CONN_DATE: c.CONN_DATE,
        TARIFF: c.TARIFF,
        LAST_BILL_DATE: lastBillDate,
        hasCurrentMonthRead,
        coverage,
        installedThisMonthNoBill
      });
    }

    offset += customers.length;
  }

  return result;
}

// Detailed list of bill stop customers with last bill date and basic info
const getBillStopCustomers = async (req, res) => {
  try {
    const result = await getBillStopCustomerData();
    res.status(200).json({ customers: result });
  } catch (error) {
    console.error('Error fetching bill stop customers:', error);
    res.status(500).json({ error: 'Failed to fetch bill stop customers' });
  }
};




module.exports = {
  uploadAndAnalyze,
  getBillStopAnalysis,
  getBillStopReport,
  computeBillStopSummary,
  getBillStopCustomers,
};


