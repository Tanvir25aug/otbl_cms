
const Complaint = require('../models/Complaint');
const ComplaintCategory = require('../models/ComplaintCategory');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { Op } = require('sequelize');
const Customer = require('../models/Customer');
const LastBillDate = require('../models/LastBillDate');
const MeterReading = require('../models/MeterReading');
const MeterReplacement = require('../models/MeterReplacement');
const TelegramNotificationSetting = require('../models/TelegramNotificationSetting');
const telegramService = require('../services/telegramService');
const { getBillStatusForComplaint } = require('./billStopAnalysisController');

// Fetch real customer details from database
const getCustomerDetails = async (searchValue) => {
    try {
        // Try to find customer by Customer ID or Meter Number
        const customer = await Customer.findOne({
            where: {
                [Op.or]: [
                    { CUSTOMER_NUM: searchValue },
                    { METER_NO: searchValue }
                ]
            }
        });

        if (!customer) {
            return null;
        }

        // Fetch last bill date
        const lastBillDate = await LastBillDate.findOne({
            where: { CUSTOMER_NUM: customer.CUSTOMER_NUM }
        });

        return {
            NOCS: customer.NOCS_NAME,
            CustomerID: customer.CUSTOMER_NUM,
            MeterNumber: customer.METER_NO,
            ConnectionDate: customer.CONN_DATE,
            CustomerName: customer.CUSTOMER_NAME,
            Address: customer.ADDRESS,
            Mobile: customer.MOBILE_NO,
            Tariff: customer.TARIFF,
            LastBillDate: lastBillDate ? lastBillDate.LAST_BILL_DATE : null,
            BillStatus: 'N/A', // This would need to be determined by billing logic
            Phase: customer.PHASE,
            SanctionLoad: customer.SANCTION_LOAD,
            FeederNo: customer.FEEDER_NO,
            FeederName: customer.FEEDER_NAME
        };
    } catch (error) {
        console.error('Error fetching customer details:', error);
        throw error;
    }
};


exports.createComplaint = async (req, res) => {
    const { complaintCategoryId, customerId, issueDescription, status } = req.body;
    const agentId = req.user.id; // Assuming auth middleware adds user to req

    try {
        const customerInfo = await getCustomerDetails(customerId);
        if (!customerInfo) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Get complaint category details
        const category = await ComplaintCategory.findByPk(complaintCategoryId);

        // AUTO-STATUS PROGRESSION: New complaint → Auto-set to "Open"
        let complaintStatus = status || 'Open';
        let autoClosedReason = null;
        let billStatusInfo = null;

        // BILL STOP - Get Bill Status for Bill Stop complaints
        if (category && category.name === 'Bill Stop') {
            console.log(`Checking Bill Status for customer: ${customerInfo.CustomerID}`);
            billStatusInfo = await getBillStatusForComplaint(customerInfo.CustomerID);

            if (billStatusInfo && !billStatusInfo.error) {
                // Add Bill Status to customerInfo
                customerInfo.BillStatus = billStatusInfo.billStatus;

                // If bill status is "Bill Start", auto-close the complaint
                if (billStatusInfo.shouldAutoClose) {
                    complaintStatus = 'Close';
                    autoClosedReason = `Auto-closed: Bill Stop complaint but billing is active (${billStatusInfo.billStatus})`;
                } else {
                    // Bill is actually stopped or not generated - set to In Progress
                    complaintStatus = 'In Progress';
                }
            }
        }

        // DYNAMIC AUTO-CLOSE LOGIC using TelegramNotificationSetting (for non-Bill Stop categories)
        if (category && category.name !== 'Bill Stop') {
            // Get notification settings for this category
            const notificationSetting = await TelegramNotificationSetting.findOne({
                where: { categoryId: complaintCategoryId }
            });

            // If settings exist and autoClose is enabled
            if (notificationSetting && notificationSetting.autoClose) {
                // For all other categories with autoClose enabled, close immediately
                complaintStatus = 'Close';
                autoClosedReason = notificationSetting.autoCloseReason ||
                    `Auto-closed: ${category.name} complaint`;
            }
        }

        // Create complaint
        const complaint = await Complaint.create({
            complaintCategoryId,
            customerId: customerInfo.CustomerID,
            meterNumber: customerInfo.MeterNumber,
            issueDescription: issueDescription || '',
            agentId,
            status: complaintStatus,
            customerInfo
        });

        // Fetch complete complaint with relations for Telegram
        const complaintWithDetails = await Complaint.findByPk(complaint.id, {
            include: [
                { model: User, as: 'agent', attributes: ['id', 'fullName', 'email'] },
                { model: ComplaintCategory, attributes: ['id', 'name'] }
            ]
        });

        // TELEGRAM NOTIFICATION - Check if enabled and timing is appropriate
        const notificationSetting = await TelegramNotificationSetting.findOne({
            where: { categoryId: complaintCategoryId }
        });

        // Determine if we should send notification based on timing settings
        const shouldSendNotification = () => {
            if (!notificationSetting) return true; // Default: send notification
            if (!notificationSetting.enabled) return false; // Notifications disabled

            const timing = notificationSetting.notificationTiming || 'both';
            const isClosed = complaintStatus === 'Close';

            if (timing === 'both') return true; // Send on both open and close
            if (timing === 'open' && !isClosed) return true; // Send only on open
            if (timing === 'close' && isClosed) return true; // Send only on close

            return false;
        };

        if (shouldSendNotification()) {
            const action = autoClosedReason ? 'auto-closed' : 'created';

            // For Bill Stop complaints, fetch additional billing data
            let additionalData = {};
            if (category && category.name === 'Bill Stop') {
                try {
                    const MeterReading = require('../models/MeterReading');
                    const MeterReplacement = require('../models/MeterReplacement');

                    // Get all meter readings
                    const readings = await MeterReading.findAll({
                        where: { METER_NO: customerInfo.MeterNumber },
                        order: [['reading_date', 'DESC']]
                    });

                    // Calculate covered and missing months AFTER last bill date
                    const currentDate = new Date();
                    const coveredMonths = [];
                    const missingMonths = [];
                    const allMonths = [];

                    // Get last bill date from customerInfo
                    const lastBillDate = customerInfo.LastBillDate ? new Date(customerInfo.LastBillDate) : null;

                    // Start from the month AFTER last bill date, or from connection date if no last bill
                    let startDate;
                    if (lastBillDate) {
                        startDate = new Date(lastBillDate);
                        startDate.setMonth(startDate.getMonth() + 1); // Start from next month after last bill
                    } else {
                        startDate = new Date(customerInfo.ConnectionDate);
                    }

                    // Generate all months from start date to current
                    let tempDate = new Date(startDate);
                    while (tempDate <= currentDate) {
                        const monthYear = `${String(tempDate.getMonth() + 1).padStart(2, '0')}-${tempDate.getFullYear()}`;
                        allMonths.push(monthYear);
                        tempDate.setMonth(tempDate.getMonth() + 1);
                    }

                    // Check which months have readings
                    const readingMonths = readings.map(r => {
                        const date = new Date(r.reading_date);
                        return `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                    });

                    // Only check months after last bill date
                    allMonths.forEach(month => {
                        if (readingMonths.includes(month)) {
                            coveredMonths.push(month);
                        } else {
                            missingMonths.push(month);
                        }
                    });

                    // Check current month reading
                    const currentMonth = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`;
                    const currentMonthReading = readingMonths.includes(currentMonth);

                    // Check for meter replacement
                    const replacement = await MeterReplacement.findOne({
                        where: {
                            [require('sequelize').Op.or]: [
                                { oldMeterNumber: customerInfo.MeterNumber },
                                { replaceMeterNumber: customerInfo.MeterNumber }
                            ]
                        }
                    });

                    additionalData = {
                        totalReadings: readings.length,
                        coveredMonths: coveredMonths.slice(-6), // Last 6 covered months
                        missingMonths: missingMonths.slice(-6), // Last 6 missing months
                        currentMonthReading,
                        hasReplacement: !!replacement,
                        replacementDate: replacement ? new Date(replacement.replaceDate).toLocaleDateString() : null,
                        oldMeter: replacement ? replacement.oldMeterNumber : null,
                        newMeter: replacement ? replacement.replaceMeterNumber : null
                    };
                } catch (err) {
                    console.error('Error fetching billing data for Telegram:', err);
                    // Continue with notification even if billing data fetch fails
                }
            }

            telegramService.sendComplaintNotification(complaintWithDetails, action, additionalData)
                .catch(err => console.error('Telegram notification failed:', err));
        }

        res.status(201).json({
            ...complaint.toJSON(),
            autoClosedReason,
            ComplaintCategory: category
        });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getComplaints = async (req, res) => {
    const { category, status, search, excludeClose, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    let where = {};

    if (category) {
        where.complaintCategoryId = category;
    }
    if (status) {
        where.status = status;
    }

    // Exclude closed complaints if excludeClose is true
    if (excludeClose === 'true' && !status) {
        where.status = { [Op.ne]: 'Close' };
    }

    if (search) {
        where[Op.or] = [
            { customerId: { [Op.like]: `%${search}%` } },
            { meterNumber: { [Op.like]: `%${search}%` } },
            { issueDescription: { [Op.like]: `%${search}%` } },
        ];
    }

    try {
        const [complaints, statusCountsRaw] = await Promise.all([
            Complaint.findAndCountAll({
                where,
                include: [
                    { model: User, as: 'agent', attributes: ['id', 'fullName', 'email'] },
                    { model: ComplaintCategory, attributes: ['id', 'name'] }
                ],
                limit: limitNum,
                offset: (pageNum - 1) * limitNum,
                order: [['createdAt', 'DESC']]
            }),
            Complaint.findAll({
                attributes: [
                    'status',
                    [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
                ],
                group: ['status'],
                raw: true
            })
        ]);

        const statusCounts = { total: 0, Open: 0, 'In Progress': 0, Close: 0 };
        statusCountsRaw.forEach(row => {
            statusCounts[row.status] = parseInt(row.count) || 0;
            statusCounts.total += parseInt(row.count) || 0;
        });

        res.json({
            ...complaints,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: complaints.count,
                totalPages: Math.ceil(complaints.count / limitNum)
            },
            statusCounts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id, {
            include: [
                { model: User, as: 'agent', attributes: ['id', 'fullName', 'email'] },
                { model: ComplaintCategory, attributes: ['id', 'name'] }
            ]
        });
        if (complaint) {
            res.json(complaint);
        } else {
            res.status(404).json({ message: 'Complaint not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        if (complaint) {
            const oldStatus = complaint.status;
            await complaint.update(req.body);

            // Check if status changed to Close
            const newStatus = req.body.status || complaint.status;
            const wasJustClosed = oldStatus !== 'Close' && newStatus === 'Close';

            // Send notification if complaint was just closed
            if (wasJustClosed) {
                const notificationSetting = await TelegramNotificationSetting.findOne({
                    where: { categoryId: complaint.complaintCategoryId }
                });

                // Check if we should send notification on close
                const shouldNotify = !notificationSetting ||
                    (notificationSetting.enabled &&
                     (notificationSetting.notificationTiming === 'close' ||
                      notificationSetting.notificationTiming === 'both'));

                if (shouldNotify) {
                    const complaintWithDetails = await Complaint.findByPk(complaint.id, {
                        include: [
                            { model: User, as: 'agent', attributes: ['id', 'fullName', 'email'] },
                            { model: ComplaintCategory, attributes: ['id', 'name'] }
                        ]
                    });

                    telegramService.sendComplaintNotification(complaintWithDetails, 'closed')
                        .catch(err => console.error('Telegram notification failed:', err));
                }
            }

            res.json(complaint);
        } else {
            res.status(404).json({ message: 'Complaint not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        if (complaint) {
            await complaint.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Complaint not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCustomerInfo = async (req, res) => {
    try {
        const customerInfo = await getCustomerDetails(req.params.customerId);
        if (customerInfo) {
            res.json(customerInfo);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Analytics endpoint
exports.getComplaintAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            };
        }

        // Total complaints
        const totalComplaints = await Complaint.count({ where: dateFilter });

        // Status-wise count
        const statusWiseReport = await Complaint.findAll({
            where: dateFilter,
            attributes: [
                'status',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['status']
        });

        // Category-wise count
        const categoryWiseReport = await Complaint.findAll({
            where: dateFilter,
            attributes: [
                'complaintCategoryId',
                [require('sequelize').fn('COUNT', require('sequelize').col('Complaint.id')), 'count']
            ],
            include: [
                { model: ComplaintCategory, attributes: ['id', 'name'] }
            ],
            group: ['complaintCategoryId', 'ComplaintCategory.id', 'ComplaintCategory.name']
        });

        // Agent-wise count
        const agentWiseReport = await Complaint.findAll({
            where: dateFilter,
            attributes: [
                'agentId',
                [require('sequelize').fn('COUNT', require('sequelize').col('Complaint.id')), 'count']
            ],
            include: [
                { model: User, as: 'agent', attributes: ['id', 'fullName', 'email'] }
            ],
            group: ['agentId', 'agent.id', 'agent.fullName', 'agent.email']
        });

        // Top agent (by complaint count)
        const topAgent = agentWiseReport.length > 0
            ? agentWiseReport.reduce((max, current) =>
                parseInt(current.dataValues.count) > parseInt(max.dataValues.count) ? current : max
              )
            : null;

        // Most common issue (category)
        const mostCommonIssue = categoryWiseReport.length > 0
            ? categoryWiseReport.reduce((max, current) =>
                parseInt(current.dataValues.count) > parseInt(max.dataValues.count) ? current : max
              )
            : null;

        // Monthly complaints (last 12 months) - using strftime for SQLite compatibility
        const sequelize = require('sequelize');
        const monthExpr = sequelize.fn('strftime', '%Y-%m', sequelize.col('createdAt'));
        const monthlyComplaints = await Complaint.findAll({
            attributes: [
                [monthExpr, 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12))
                }
            },
            group: [sequelize.fn('strftime', '%Y-%m', sequelize.col('createdAt'))],
            order: [[sequelize.fn('strftime', '%Y-%m', sequelize.col('createdAt')), 'ASC']]
        });

        // Daily average (complaints per day in the filtered period)
        const days = startDate && endDate
            ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
            : 30; // Default to 30 days if no filter
        const dailyAverage = days > 0 ? (totalComplaints / days).toFixed(2) : 0;

        res.json({
            totalComplaints,
            dailyAverage,
            mostCommonIssue: mostCommonIssue ? {
                category: mostCommonIssue.ComplaintCategory?.name || 'Unknown',
                count: mostCommonIssue.dataValues.count
            } : null,
            topAgent: topAgent ? {
                name: topAgent.agent?.fullName || 'Unknown',
                count: topAgent.dataValues.count
            } : null,
            statusWiseReport: statusWiseReport.map(item => ({
                status: item.status,
                count: item.dataValues.count
            })),
            categoryWiseReport: categoryWiseReport.map(item => ({
                category: item.ComplaintCategory?.name || 'Unknown',
                categoryId: item.complaintCategoryId,
                count: item.dataValues.count
            })),
            agentWiseReport: agentWiseReport.map(item => ({
                agentId: item.agentId,
                agentName: item.agent?.fullName || 'Unassigned',
                agentEmail: item.agent?.email || '',
                count: item.dataValues.count
            })),
            monthlyComplaints: monthlyComplaints.map(item => ({
                month: item.dataValues.month,
                count: item.dataValues.count
            }))
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get comprehensive customer billing information
const getCustomerBillingInfo = async (req, res) => {
    try {
        const { searchValue } = req.params;

        // Find customer by Customer ID or Meter Number
        const customer = await Customer.findOne({
            where: {
                [Op.or]: [
                    { CUSTOMER_NUM: searchValue },
                    { METER_NO: searchValue }
                ]
            }
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Get last bill date
        const lastBillRecord = await LastBillDate.findOne({
            where: { CUSTOMER_NUM: customer.CUSTOMER_NUM }
        });

        const lastBillDate = lastBillRecord ? lastBillRecord.LAST_BILL_DATE : null;
        const now = new Date();
        let billStatus = 'Unknown';
        let billStopReason = '';
        let monthsSinceBill = 0;
        let missingReadings = 0;

        // Determine bill status
        if (lastBillDate) {
            const lb = new Date(lastBillDate);
            const monthsDiff = (now.getFullYear() - lb.getFullYear()) * 12 + (now.getMonth() - lb.getMonth());

            if (monthsDiff === 0) {
                billStatus = 'Bill Generated (Current Month)';
            } else if (monthsDiff > 0) {
                billStatus = 'Bill Stopped';
                monthsSinceBill = monthsDiff;
                billStopReason = `Bill has been stopped for ${monthsDiff} month(s). Last bill was generated on ${lb.toLocaleDateString()}.`;
            }
        } else {
            billStatus = 'Bill Not Generated';
            billStopReason = 'No billing record found for this customer.';
        }

        // Get meter readings to calculate covered months
        const meterReadings = await MeterReading.findAll({
            where: { meter_no: customer.METER_NO },
            order: [['reading_date', 'DESC']],
            limit: 24 // Last 2 years
        });

        // Calculate covered months (months with readings)
        const coveredMonths = [];
        const readingMonths = new Set();

        meterReadings.forEach(reading => {
            if (reading.reading_date) {
                const date = new Date(reading.reading_date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!readingMonths.has(monthKey)) {
                    readingMonths.add(monthKey);
                    coveredMonths.push({
                        month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
                        date: date.toISOString().split('T')[0],
                        value: reading.value_kwh || reading.TOTAL_ENERGY || 'N/A',
                        isEstimated: reading.is_estimated || false
                    });
                }
            }
        });

        // Calculate missing readings
        if (lastBillDate) {
            const lb = new Date(lastBillDate);
            const expectedMonths = (now.getFullYear() - lb.getFullYear()) * 12 + (now.getMonth() - lb.getMonth());
            missingReadings = Math.max(0, expectedMonths - coveredMonths.length);
        }

        // Check for meter replacement
        const meterReplacement = await MeterReplacement.findOne({
            where: {
                [Op.or]: [
                    { oldMeterNumber: customer.METER_NO },
                    { replaceMeterNumber: customer.METER_NO }
                ]
            },
            order: [['replaceDate', 'DESC']]
        });

        let replacementInfo = null;
        if (meterReplacement) {
            replacementInfo = {
                oldMeter: meterReplacement.oldMeterNumber,
                newMeter: meterReplacement.replaceMeterNumber,
                replaceDate: meterReplacement.replaceDate,
                status: meterReplacement.status
            };

            // Add meter replacement info to bill stop reason if applicable
            if (billStatus === 'Bill Stopped' || billStatus === 'Bill Not Generated') {
                billStopReason += ` Meter was replaced on ${new Date(meterReplacement.replaceDate).toLocaleDateString()}.`;
            }
        }

        // Analyze why bill is stopped
        let billStopAnalysis = '';
        if (billStatus === 'Bill Stopped' || billStatus === 'Bill Not Generated') {
            if (missingReadings > 0) {
                billStopAnalysis = `Missing ${missingReadings} monthly reading(s) after last bill date. `;
            }

            if (coveredMonths.length === 0) {
                billStopAnalysis += 'No meter readings available in the system. ';
            } else if (coveredMonths.length < monthsSinceBill) {
                billStopAnalysis += `Only ${coveredMonths.length} out of ${monthsSinceBill} expected readings are available. `;
            }

            if (meterReplacement) {
                const replaceDate = new Date(meterReplacement.replaceDate);
                if (lastBillDate && replaceDate > new Date(lastBillDate)) {
                    billStopAnalysis += 'Meter was replaced after last bill. Final bill for old meter may be pending. ';
                }
            }

            if (!billStopAnalysis) {
                billStopAnalysis = 'Bill stop reason requires further investigation. Contact billing team.';
            }
        }

        // Prepare response
        const response = {
            customerInfo: {
                customerId: customer.CUSTOMER_NUM,
                customerName: customer.CUSTOMER_NAME,
                meterNumber: customer.METER_NO,
                address: customer.ADDRESS,
                mobile: customer.MOBILE_NO,
                tariff: customer.TARIFF,
                phase: customer.PHASE,
                sanctionLoad: customer.SANCTION_LOAD,
                connectionDate: customer.CONN_DATE,
                feederNo: customer.FEEDER_NO,
                feederName: customer.FEEDER_NAME,
                nocsName: customer.NOCS_NAME
            },
            billingInfo: {
                billStatus,
                lastBillDate: lastBillDate ? new Date(lastBillDate).toLocaleDateString() : 'N/A',
                monthsSinceLastBill: monthsSinceBill,
                billStopReason: billStopReason || 'N/A',
                billStopAnalysis: billStopAnalysis || 'N/A'
            },
            readingInfo: {
                totalReadingsAvailable: meterReadings.length,
                coveredMonthsCount: coveredMonths.length,
                missingReadingsCount: missingReadings,
                coveredMonths: coveredMonths.slice(0, 12), // Last 12 months
                latestReading: meterReadings.length > 0 ? {
                    date: meterReadings[0].reading_date,
                    value: meterReadings[0].value_kwh || meterReadings[0].TOTAL_ENERGY || 'N/A',
                    isEstimated: meterReadings[0].is_estimated || false
                } : null
            },
            meterReplacement: replacementInfo
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching customer billing info:', error);
        res.status(500).json({ message: 'Error fetching customer billing information', error: error.message });
    }
};

exports.getCustomerBillingInfo = getCustomerBillingInfo;
