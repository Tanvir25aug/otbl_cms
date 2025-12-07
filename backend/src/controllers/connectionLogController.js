const ConnectionLog = require('../models/ConnectionLog');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const xlsx = require('xlsx');

// Get connection analytics overview
const getConnectionAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // Build where clause
    const where = {};
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.timestamp = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.timestamp = {
        [Op.lte]: new Date(endDate)
      };
    }

    if (userId) {
      where.userId = userId;
    }

    // Get total RC and DC operations by status (using metadata command_status)
    // Build where clause for metadata query
    let statusWhereClause = '';
    if (where.timestamp) {
      if (where.timestamp[Op.between]) {
        statusWhereClause = `AND timestamp BETWEEN '${where.timestamp[Op.between][0].toISOString()}' AND '${where.timestamp[Op.between][1].toISOString()}'`;
      } else if (where.timestamp[Op.gte]) {
        statusWhereClause = `AND timestamp >= '${where.timestamp[Op.gte].toISOString()}'`;
      } else if (where.timestamp[Op.lte]) {
        statusWhereClause = `AND timestamp <= '${where.timestamp[Op.lte].toISOString()}'`;
      }
    }

    const [statusCounts] = await sequelize.query(`
      SELECT
        COUNT(CASE WHEN eventType = 'RC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'COMPLETED' THEN 1 END) as rcCompleted,
        COUNT(CASE WHEN eventType = 'RC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'COMINPROG' THEN 1 END) as rcInProgress,
        COUNT(CASE WHEN eventType = 'RC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'DISCARDED' THEN 1 END) as rcDiscarded,
        COUNT(CASE WHEN eventType = 'DC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'COMPLETED' THEN 1 END) as dcCompleted,
        COUNT(CASE WHEN eventType = 'DC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'COMINPROG' THEN 1 END) as dcInProgress,
        COUNT(CASE WHEN eventType = 'DC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'DISCARDED' THEN 1 END) as dcDiscarded
      FROM connection_logs
      WHERE 1=1 ${statusWhereClause}
    `);

    const rcCompleted = parseInt(statusCounts[0].rcCompleted) || 0;
    const rcInProgress = parseInt(statusCounts[0].rcInProgress) || 0;
    const rcDiscarded = parseInt(statusCounts[0].rcDiscarded) || 0;
    const dcCompleted = parseInt(statusCounts[0].dcCompleted) || 0;
    const dcInProgress = parseInt(statusCounts[0].dcInProgress) || 0;
    const dcDiscarded = parseInt(statusCounts[0].dcDiscarded) || 0;

    const totalRC = rcCompleted + rcInProgress + rcDiscarded;
    const totalDC = dcCompleted + dcInProgress + dcDiscarded;

    // Get currently connected users (RC without matching DC)
    const currentlyConnected = await ConnectionLog.findAll({
      attributes: [
        'userId',
        [sequelize.fn('MAX', sequelize.col('timestamp')), 'lastEvent'],
        [sequelize.fn('MAX', sequelize.literal("CASE WHEN eventType = 'RC' THEN timestamp END")), 'lastRC'],
        [sequelize.fn('MAX', sequelize.literal("CASE WHEN eventType = 'DC' THEN timestamp END")), 'lastDC']
      ],
      where,
      group: ['userId'],
      raw: true
    });

    const activeUsers = currentlyConnected.filter(log => {
      return !log.lastDC || new Date(log.lastRC) > new Date(log.lastDC);
    }).length;

    // Get operations by user
    const operationsByUser = await ConnectionLog.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN eventType = 'RC' THEN 1 END")), 'rcCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN eventType = 'DC' THEN 1 END")), 'dcCount'],
        [sequelize.fn('COUNT', sequelize.col('ConnectionLog.id')), 'totalOperations']
      ],
      where,
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'fullName', 'email', 'phoneNumber', 'role']
      }],
      group: ['userId', 'User.id'],
      order: [[sequelize.literal('totalOperations'), 'DESC']],
      limit: 10
    });

    // Get hourly distribution
    const hourlyDistribution = await ConnectionLog.findAll({
      attributes: [
        [sequelize.fn('strftime', '%Y-%m-%d %H:00:00', sequelize.col('timestamp')), 'hour'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN eventType = 'RC' THEN 1 END")), 'rcCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN eventType = 'DC' THEN 1 END")), 'dcCount']
      ],
      where,
      group: [sequelize.fn('strftime', '%Y-%m-%d %H:00:00', sequelize.col('timestamp'))],
      order: [[sequelize.fn('strftime', '%Y-%m-%d %H:00:00', sequelize.col('timestamp')), 'ASC']],
      raw: true
    });

    // Get average connection duration
    const avgDuration = await ConnectionLog.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('duration')), 'avgDuration']
      ],
      where: {
        ...where,
        eventType: 'DC',
        duration: { [Op.not]: null }
      },
      raw: true
    });

    // Get daily statistics
    const dailyStats = await ConnectionLog.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('timestamp')), 'date'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN eventType = 'RC' THEN 1 END")), 'rcCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN eventType = 'DC' THEN 1 END")), 'dcCount']
      ],
      where,
      group: [sequelize.fn('date', sequelize.col('timestamp'))],
      order: [[sequelize.fn('date', sequelize.col('timestamp')), 'DESC']],
      limit: 30,
      raw: true
    });

    // Get unique meter counts
    let uniqueMetersWhereClause = '';
    if (where.timestamp) {
      if (where.timestamp[Op.between]) {
        uniqueMetersWhereClause = `WHERE timestamp BETWEEN '${where.timestamp[Op.between][0].toISOString()}' AND '${where.timestamp[Op.between][1].toISOString()}'`;
      } else if (where.timestamp[Op.gte]) {
        uniqueMetersWhereClause = `WHERE timestamp >= '${where.timestamp[Op.gte].toISOString()}'`;
      } else if (where.timestamp[Op.lte]) {
        uniqueMetersWhereClause = `WHERE timestamp <= '${where.timestamp[Op.lte].toISOString()}'`;
      }
    }

    const uniqueMetersQuery = `
      SELECT
        COUNT(DISTINCT CASE WHEN json_extract(metadata, '$.msn') IS NOT NULL THEN json_extract(metadata, '$.msn') END) as totalUniqueMeters,
        COUNT(DISTINCT CASE WHEN eventType = 'RC' AND json_extract(metadata, '$.msn') IS NOT NULL THEN json_extract(metadata, '$.msn') END) as uniqueMetersRC,
        COUNT(DISTINCT CASE WHEN eventType = 'DC' AND json_extract(metadata, '$.msn') IS NOT NULL THEN json_extract(metadata, '$.msn') END) as uniqueMetersDC
      FROM connection_logs
      ${uniqueMetersWhereClause}
    `;

    const [uniqueMetersResult] = await sequelize.query(uniqueMetersQuery);
    const uniqueMetersData = uniqueMetersResult[0] || { totalUniqueMeters: 0, uniqueMetersRC: 0, uniqueMetersDC: 0 };

    // Get meter-wise latest status (shows current status of each meter)
    let meterWiseWhereClause = '';
    if (where.timestamp) {
      if (where.timestamp[Op.between]) {
        meterWiseWhereClause = `AND timestamp BETWEEN '${where.timestamp[Op.between][0].toISOString()}' AND '${where.timestamp[Op.between][1].toISOString()}'`;
      } else if (where.timestamp[Op.gte]) {
        meterWiseWhereClause = `AND timestamp >= '${where.timestamp[Op.gte].toISOString()}'`;
      } else if (where.timestamp[Op.lte]) {
        meterWiseWhereClause = `AND timestamp <= '${where.timestamp[Op.lte].toISOString()}'`;
      }
    }

    const meterWiseStatusQuery = `
      WITH LatestStatus AS (
        SELECT
          json_extract(metadata, '$.msn') as msn,
          json_extract(metadata, '$.old_consumer_id') as customer_id,
          COALESCE(ipAddress, json_extract(metadata, '$.nocs_name')) as nocs,
          eventType,
          COALESCE(TRIM(commandStatus), TRIM(json_extract(metadata, '$.command_status'))) as commandStatus,
          timestamp,
          ROW_NUMBER() OVER (PARTITION BY json_extract(metadata, '$.msn') ORDER BY timestamp DESC) as rn
        FROM connection_logs
        WHERE json_extract(metadata, '$.msn') IS NOT NULL
        ${meterWiseWhereClause}
      )
      SELECT
        msn,
        customer_id,
        nocs,
        eventType as currentStatus,
        commandStatus,
        timestamp as lastOperationTime
      FROM LatestStatus
      WHERE rn = 1
      ORDER BY timestamp DESC
      LIMIT 100
    `;

    const [meterWiseStatus] = await sequelize.query(meterWiseStatusQuery);

    // Get meter-wise current status counts (unique meters by their latest status)
    const meterStatusCountsQuery = `
      WITH LatestStatus AS (
        SELECT
          json_extract(metadata, '$.msn') as msn,
          eventType,
          COALESCE(TRIM(commandStatus), TRIM(json_extract(metadata, '$.command_status'))) as commandStatus,
          timestamp,
          ROW_NUMBER() OVER (PARTITION BY json_extract(metadata, '$.msn') ORDER BY timestamp DESC) as rn
        FROM connection_logs
        WHERE json_extract(metadata, '$.msn') IS NOT NULL
        ${meterWiseWhereClause}
      )
      SELECT
        COUNT(CASE WHEN eventType = 'RC' AND commandStatus = 'COMPLETED' THEN 1 END) as rcCompletedMeters,
        COUNT(CASE WHEN eventType = 'RC' AND commandStatus = 'COMINPROG' THEN 1 END) as rcInProgressMeters,
        COUNT(CASE WHEN eventType = 'DC' AND commandStatus = 'COMPLETED' THEN 1 END) as dcCompletedMeters,
        COUNT(CASE WHEN eventType = 'DC' AND commandStatus = 'COMINPROG' THEN 1 END) as dcInProgressMeters,
        COUNT(CASE WHEN eventType = 'DC' AND commandStatus = 'DISCARDED' THEN 1 END) as dcDiscardedMeters,
        COUNT(*) as totalMetersWithStatus
      FROM LatestStatus
      WHERE rn = 1
    `;

    const [meterStatusCountsResult] = await sequelize.query(meterStatusCountsQuery);
    const meterStatusCounts = meterStatusCountsResult[0] || {
      rcCompletedMeters: 0,
      rcInProgressMeters: 0,
      dcCompletedMeters: 0,
      dcInProgressMeters: 0,
      dcDiscardedMeters: 0,
      totalMetersWithStatus: 0
    };

    // Get NOCS-wise breakdown with unique meters
    const nocswiseQuery = `
      SELECT
        COALESCE(ipAddress, json_extract(metadata, '$.nocs_name')) as ipAddress,
        COUNT(CASE WHEN eventType = 'RC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'COMPLETED' THEN 1 END) as rcCompleted,
        COUNT(CASE WHEN eventType = 'RC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'COMINPROG' THEN 1 END) as rcInProgress,
        COUNT(CASE WHEN eventType = 'DC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'COMPLETED' THEN 1 END) as dcCompleted,
        COUNT(CASE WHEN eventType = 'DC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'COMINPROG' THEN 1 END) as dcInProgress,
        COUNT(CASE WHEN eventType = 'DC' AND TRIM(COALESCE(commandStatus, json_extract(metadata, '$.command_status'))) = 'DISCARDED' THEN 1 END) as dcDiscarded,
        COUNT(*) as totalOperations
      FROM connection_logs
      WHERE 1=1 ${statusWhereClause}
      GROUP BY COALESCE(ipAddress, json_extract(metadata, '$.nocs_name'))
      ORDER BY totalOperations DESC
    `;

    const [nocswiseReport] = await sequelize.query(nocswiseQuery);

    // Format NOCS-wise report
    const formattedNocswiseReport = nocswiseReport.map(row => ({
      nocs: row.ipAddress || 'Unknown',
      rcCompleted: parseInt(row.rcCompleted) || 0,
      rcInProgress: parseInt(row.rcInProgress) || 0,
      dcCompleted: parseInt(row.dcCompleted) || 0,
      dcInProgress: parseInt(row.dcInProgress) || 0,
      dcDiscarded: parseInt(row.dcDiscarded) || 0,
      totalOperations: parseInt(row.totalOperations) || 0
    }));

    res.json({
      summary: {
        totalRC,
        totalDC,
        totalOperations: totalRC + totalDC,
        activeUsers,
        avgDuration: avgDuration?.avgDuration ? Math.round(avgDuration.avgDuration) : 0,
        // RC breakdown (total operations)
        rcCompleted,
        rcInProgress,
        rcDiscarded,
        // DC breakdown (total operations)
        dcCompleted,
        dcInProgress,
        dcDiscarded,
        // Unique meter counts (total unique meters that have had operations)
        totalUniqueMeters: parseInt(uniqueMetersData.totalUniqueMeters) || 0,
        uniqueMetersRC: parseInt(uniqueMetersData.uniqueMetersRC) || 0,
        uniqueMetersDC: parseInt(uniqueMetersData.uniqueMetersDC) || 0,
        // Meter-wise current status counts (based on latest operation per meter)
        rcCompletedMeters: parseInt(meterStatusCounts.rcCompletedMeters) || 0,
        rcInProgressMeters: parseInt(meterStatusCounts.rcInProgressMeters) || 0,
        dcCompletedMeters: parseInt(meterStatusCounts.dcCompletedMeters) || 0,
        dcInProgressMeters: parseInt(meterStatusCounts.dcInProgressMeters) || 0,
        dcDiscardedMeters: parseInt(meterStatusCounts.dcDiscardedMeters) || 0,
        totalMetersWithStatus: parseInt(meterStatusCounts.totalMetersWithStatus) || 0
      },
      operationsByUser,
      hourlyDistribution,
      dailyStats,
      nocswiseReport: formattedNocswiseReport,
      meterWiseStatus: meterWiseStatus || []
    });
  } catch (error) {
    console.error('Error fetching connection analytics:', error);
    res.status(500).json({ message: 'Error fetching connection analytics', error: error.message });
  }
};

// Get recent connection logs
const getRecentConnectionLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, eventType } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) {
      where.userId = userId;
    }
    if (eventType) {
      where.eventType = eventType;
    }

    const { count, rows } = await ConnectionLog.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'fullName', 'email', 'phoneNumber', 'role']
      }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching connection logs:', error);
    res.status(500).json({ message: 'Error fetching connection logs', error: error.message });
  }
};

// Get user connection history
const getUserConnectionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const where = { userId };
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const logs = await ConnectionLog.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    const stats = await ConnectionLog.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN eventType = 'RC' THEN 1 END")), 'rcCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN eventType = 'DC' THEN 1 END")), 'dcCount'],
        [sequelize.fn('AVG', sequelize.literal("CASE WHEN eventType = 'DC' THEN duration END")), 'avgDuration']
      ],
      where,
      raw: true
    });

    res.json({
      logs,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching user connection history:', error);
    res.status(500).json({ message: 'Error fetching user connection history', error: error.message });
  }
};

// Upload RC/DC data from Excel
const uploadRCDCData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty.' });
    }

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (const row of data) {
      try {
        // Determine event type from COMMAND_TYPE
        let eventType = 'RC'; // Default to RC
        const commandType = row.COMMAND_TYPE?.toString().toUpperCase() || '';

        if (commandType.includes('D1-REMOTEDISCONNECT') || commandType.includes('DISCONNECT')) {
          eventType = 'DC';
        } else if (commandType.includes('D1-REMOTECONNECT') || commandType.includes('CONNECT')) {
          eventType = 'RC';
        }

        // Get command status
        const commandStatus = row.COMMAND_STATUS?.toString().toUpperCase() || 'UNKNOWN';
        let normalizedStatus = null;

        if (commandStatus === 'COMPLETED') {
          normalizedStatus = 'COMPLETED';
        } else if (commandStatus === 'COMINPROG' || commandStatus === 'IN_PROGRESS' || commandStatus === 'INPROGRESS') {
          normalizedStatus = 'COMINPROG';
        } else if (commandStatus === 'DISCARDED' || commandStatus === 'FAILED') {
          normalizedStatus = 'DISCARDED';
        }

        // Parse dates
        let triggerDate = null;
        if (row.DATE_OF_COMMAND_TRIGGER) {
          if (typeof row.DATE_OF_COMMAND_TRIGGER === 'number') {
            // Excel date number
            triggerDate = new Date((row.DATE_OF_COMMAND_TRIGGER - (25567 + 2)) * 86400 * 1000);
          } else {
            triggerDate = new Date(row.DATE_OF_COMMAND_TRIGGER);
          }
        }

        let responseDate = null;
        if (row.RESPONSE_DATE_AND_TIME) {
          if (typeof row.RESPONSE_DATE_AND_TIME === 'number') {
            responseDate = new Date((row.RESPONSE_DATE_AND_TIME - (25567 + 2)) * 86400 * 1000);
          } else {
            responseDate = new Date(row.RESPONSE_DATE_AND_TIME);
          }
        }

        // Calculate duration if both dates are available
        let duration = null;
        if (triggerDate && responseDate) {
          duration = Math.floor((responseDate - triggerDate) / 1000); // in seconds
        }

        // Try to find user by email or phone number
        let userId = null;
        if (row.ACCOUNT_NO || row.OLD_CONSUMER_ID) {
          const user = await User.findOne({
            where: {
              [Op.or]: [
                { email: row.ACCOUNT_NO?.toString() || '' },
                { phoneNumber: row.OLD_CONSUMER_ID?.toString() || '' }
              ]
            }
          });

          if (user) {
            userId = user.id;
          } else {
            // If no user found, use default admin
            const adminUser = await User.findOne({ where: { role: 'Admin' } });
            userId = adminUser ? adminUser.id : 1; // Fallback to user ID 1
          }
        } else {
          // Use default admin user
          const adminUser = await User.findOne({ where: { role: 'Admin' } });
          userId = adminUser ? adminUser.id : 1;
        }

        // Create connection log entry
        await ConnectionLog.create({
          userId: userId,
          eventType: eventType,
          commandStatus: normalizedStatus,
          timestamp: responseDate || triggerDate || new Date(),
          ipAddress: row.NOCS_NAME || null,
          userAgent: `MSN: ${row.MSN || 'N/A'}`,
          socketId: row.D1_ACTIVITY_ID?.toString() || null,
          duration: duration,
          metadata: {
            d1_activity_id: row.D1_ACTIVITY_ID,
            old_consumer_id: row.OLD_CONSUMER_ID,
            msn: row.MSN,
            account_no: row.ACCOUNT_NO,
            date_of_command_trigger: triggerDate,
            response_date_and_time: responseDate,
            command_type: row.COMMAND_TYPE,
            command_status: row.COMMAND_STATUS,
            sa_id: row.SA_ID,
            payoff_balance: row.PAYOFF_BALNCE,
            nocs_name: row.NOCS_NAME,
            meter_status: row.METER_STATUS,
            phase: row.PHASE,
            source: 'excel_upload'
          }
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row,
          error: error.message
        });
        console.error('Error processing row:', error);
      }
    }

    res.status(201).json({
      message: 'File uploaded and processed.',
      results: {
        total: results.total,
        success: results.success,
        failed: results.failed,
        errorCount: results.errors.length
      },
      errors: results.errors.slice(0, 10) // Return first 10 errors only
    });
  } catch (error) {
    console.error('Error uploading RC/DC data:', error);
    res.status(500).json({
      message: 'Error uploading file.',
      error: error.message
    });
  }
};

// Download sample Excel template
const downloadTemplate = async (req, res) => {
  try {
    const sampleData = [
      {
        D1_ACTIVITY_ID: 'ACT001',
        OLD_CONSUMER_ID: '29225859',
        MSN: 'MSN123456789',
        ACCOUNT_NO: '4074987485',
        DATE_OF_COMMAND_TRIGGER: new Date('2025-01-01 10:00:00'),
        RESPONSE_DATE_AND_TIME: new Date('2025-01-01 10:05:00'),
        COMMAND_TYPE: 'D1-RemoteConnect',
        COMMAND_STATUS: 'COMPLETED',
        SA_ID: 'SA001',
        PAYOFF_BALNCE: 0,
        NOCS_NAME: 'NOCS1',
        METER_STATUS: 'ON',
        PHASE: 'SINGLE'
      },
      {
        D1_ACTIVITY_ID: 'ACT002',
        OLD_CONSUMER_ID: '29225860',
        MSN: 'MSN987654321',
        ACCOUNT_NO: '4074987486',
        DATE_OF_COMMAND_TRIGGER: new Date('2025-01-01 11:00:00'),
        RESPONSE_DATE_AND_TIME: new Date('2025-01-01 11:05:00'),
        COMMAND_TYPE: 'D1-RemoteConnect',
        COMMAND_STATUS: 'COMINPROG',
        SA_ID: 'SA002',
        PAYOFF_BALNCE: 100,
        NOCS_NAME: 'NOCS2',
        METER_STATUS: 'PENDING',
        PHASE: 'SINGLE'
      },
      {
        D1_ACTIVITY_ID: 'ACT003',
        OLD_CONSUMER_ID: '29225861',
        MSN: 'MSN456789123',
        ACCOUNT_NO: '4074987487',
        DATE_OF_COMMAND_TRIGGER: new Date('2025-01-01 12:00:00'),
        RESPONSE_DATE_AND_TIME: new Date('2025-01-01 12:05:00'),
        COMMAND_TYPE: 'D1-RemoteDisconnect',
        COMMAND_STATUS: 'COMPLETED',
        SA_ID: 'SA003',
        PAYOFF_BALNCE: 500,
        NOCS_NAME: 'NOCS3',
        METER_STATUS: 'OFF',
        PHASE: 'THREE'
      },
      {
        D1_ACTIVITY_ID: 'ACT004',
        OLD_CONSUMER_ID: '29225862',
        MSN: 'MSN789123456',
        ACCOUNT_NO: '4074987488',
        DATE_OF_COMMAND_TRIGGER: new Date('2025-01-01 13:00:00'),
        RESPONSE_DATE_AND_TIME: new Date('2025-01-01 13:05:00'),
        COMMAND_TYPE: 'D1-RemoteDisconnect',
        COMMAND_STATUS: 'DISCARDED',
        SA_ID: 'SA004',
        PAYOFF_BALNCE: 1000,
        NOCS_NAME: 'NOCS4',
        METER_STATUS: 'ERROR',
        PHASE: 'SINGLE'
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'RC_DC_Template');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=RC_DC_Upload_Template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Error generating template', error: error.message });
  }
};

// Upload RC/DC data from JSON
const uploadRCDCDataJSON = async (req, res) => {
  try {
    const data = req.body.data;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        message: 'Invalid data format. Expected an array of records in "data" field.',
        example: {
          data: [
            {
              D1_ACTIVITY_ID: "ACT001",
              OLD_CONSUMER_ID: "29225859",
              MSN: "MSN123456789",
              ACCOUNT_NO: "4074987485",
              DATE_OF_COMMAND_TRIGGER: "2025-01-01T10:00:00Z",
              RESPONSE_DATE_AND_TIME: "2025-01-01T10:05:00Z",
              COMMAND_TYPE: "D1-RemoteConnect",
              COMMAND_STATUS: "COMPLETED",
              SA_ID: "SA001",
              PAYOFF_BALNCE: 0,
              NOCS_NAME: "NOCS1",
              METER_STATUS: "ON",
              PHASE: "SINGLE"
            }
          ]
        }
      });
    }

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (const row of data) {
      try {
        // Determine event type from COMMAND_TYPE
        let eventType = 'RC'; // Default to RC
        const commandType = row.COMMAND_TYPE?.toString().toUpperCase() || '';

        if (commandType.includes('D1-REMOTEDISCONNECT') || commandType.includes('DISCONNECT')) {
          eventType = 'DC';
        } else if (commandType.includes('D1-REMOTECONNECT') || commandType.includes('CONNECT')) {
          eventType = 'RC';
        }

        // Get command status
        const commandStatus = row.COMMAND_STATUS?.toString().toUpperCase() || 'UNKNOWN';
        let normalizedStatus = null;

        if (commandStatus === 'COMPLETED') {
          normalizedStatus = 'COMPLETED';
        } else if (commandStatus === 'COMINPROG' || commandStatus === 'IN_PROGRESS' || commandStatus === 'INPROGRESS') {
          normalizedStatus = 'COMINPROG';
        } else if (commandStatus === 'DISCARDED' || commandStatus === 'FAILED') {
          normalizedStatus = 'DISCARDED';
        }

        // Parse dates
        let triggerDate = null;
        if (row.DATE_OF_COMMAND_TRIGGER) {
          triggerDate = new Date(row.DATE_OF_COMMAND_TRIGGER);
          if (isNaN(triggerDate.getTime())) {
            triggerDate = null;
          }
        }

        let responseDate = null;
        if (row.RESPONSE_DATE_AND_TIME) {
          responseDate = new Date(row.RESPONSE_DATE_AND_TIME);
          if (isNaN(responseDate.getTime())) {
            responseDate = null;
          }
        }

        // Calculate duration if both dates are available
        let duration = null;
        if (triggerDate && responseDate) {
          duration = Math.floor((responseDate - triggerDate) / 1000); // in seconds
        }

        // Try to find user by email or phone number
        let userId = null;
        if (row.ACCOUNT_NO || row.OLD_CONSUMER_ID) {
          const user = await User.findOne({
            where: {
              [Op.or]: [
                { email: row.ACCOUNT_NO?.toString() || '' },
                { phoneNumber: row.OLD_CONSUMER_ID?.toString() || '' }
              ]
            }
          });

          if (user) {
            userId = user.id;
          } else {
            // If no user found, use default admin
            const adminUser = await User.findOne({ where: { role: 'Admin' } });
            userId = adminUser ? adminUser.id : 1; // Fallback to user ID 1
          }
        } else {
          // Use default admin user
          const adminUser = await User.findOne({ where: { role: 'Admin' } });
          userId = adminUser ? adminUser.id : 1;
        }

        // Create connection log entry
        await ConnectionLog.create({
          userId: userId,
          eventType: eventType,
          commandStatus: normalizedStatus,
          timestamp: responseDate || triggerDate || new Date(),
          ipAddress: row.NOCS_NAME || null,
          userAgent: `MSN: ${row.MSN || 'N/A'}`,
          socketId: row.D1_ACTIVITY_ID?.toString() || null,
          duration: duration,
          metadata: {
            d1_activity_id: row.D1_ACTIVITY_ID,
            old_consumer_id: row.OLD_CONSUMER_ID,
            msn: row.MSN,
            account_no: row.ACCOUNT_NO,
            date_of_command_trigger: triggerDate,
            response_date_and_time: responseDate,
            command_type: row.COMMAND_TYPE,
            command_status: row.COMMAND_STATUS,
            sa_id: row.SA_ID,
            payoff_balance: row.PAYOFF_BALNCE,
            nocs_name: row.NOCS_NAME,
            meter_status: row.METER_STATUS,
            phase: row.PHASE,
            source: 'json_api'
          }
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row,
          error: error.message
        });
        console.error('Error processing row:', error);
      }
    }

    res.status(201).json({
      message: 'JSON data uploaded and processed.',
      results: {
        total: results.total,
        success: results.success,
        failed: results.failed,
        errorCount: results.errors.length
      },
      errors: results.errors.slice(0, 10) // Return first 10 errors only
    });
  } catch (error) {
    console.error('Error uploading RC/DC JSON data:', error);
    res.status(500).json({
      message: 'Error uploading JSON data.',
      error: error.message
    });
  }
};

// Delete all connection logs
const deleteAllConnectionLogs = async (req, res) => {
  try {
    const count = await ConnectionLog.count();

    if (count === 0) {
      return res.status(200).json({
        message: 'No data to delete.',
        deletedCount: 0
      });
    }

    await ConnectionLog.destroy({ where: {}, truncate: true });

    res.status(200).json({
      message: 'All connection logs deleted successfully.',
      deletedCount: count
    });
  } catch (error) {
    console.error('Error deleting all connection logs:', error);
    res.status(500).json({
      message: 'Error deleting connection logs.',
      error: error.message
    });
  }
};

module.exports = {
  getConnectionAnalytics,
  getRecentConnectionLogs,
  getUserConnectionHistory,
  uploadRCDCData,
  uploadRCDCDataJSON,
  downloadTemplate,
  deleteAllConnectionLogs
};
