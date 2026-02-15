const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const ticketRoutes = require('./tickets');
const sprintRoutes = require('./sprints');
const contentRoutes = require('./content');
const meterReadingRoutes = require('./meterReadings');
const customerRoutes = require('./customers');
const lastBillDateRoutes = require('./lastBillDate');
const meterReplacementRoutes = require('./meterReplacement');
const mdmReadsRoutes = require('./mdmReads');
const userRoutes = require('./users'); // Added user routes
const reportRoutes = require('./reports');
const notificationRoutes = require('./notifications');
const projectRoutes = require('./projects');
const teamRoutes = require('./teams');
const batchOperationalReportRoutes = require('./batchOperationalReport');
const billStopAnalysisRoutes = require('./billStopAnalysis');
const dailyBillingReportRoutes = require('./dailyBillingReport');
const complaintRoutes = require('./complaints');
const complaintCategoryRoutes = require('./complaintCategories');
const billStopRoutes = require('./billStop');
const telegramNotificationRoutes = require('./telegramNotifications');
const telegramRoutes = require('./telegram');
const analyticsRoutes = require('./analytics');
const exportRoutes = require('./export');
const connectionLogRoutes = require('./connectionLogs');
const cmoRoutes = require('./cmo');

router.use('/auth', authRoutes);
router.use('/users', userRoutes); // Added user routes
router.use('/tickets', ticketRoutes);
router.use('/sprints', sprintRoutes);
router.use('/content', contentRoutes);
router.use('/meter-readings', meterReadingRoutes);
router.use('/bill-stop', billStopRoutes);
router.use('/customers', customerRoutes);
router.use('/last-bill-date', lastBillDateRoutes);
router.use('/meter-replacement', meterReplacementRoutes);
router.use('/meter-replacements', meterReplacementRoutes); // Alias for consistency
router.use('/mdm-reads', mdmReadsRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/projects', projectRoutes);
router.use('/teams', teamRoutes);
router.use('/batch-operational-report', batchOperationalReportRoutes);
router.use('/bill-stop-analysis', billStopAnalysisRoutes);
router.use('/daily-billing-report', dailyBillingReportRoutes);
router.use('/complaints', complaintRoutes);
router.use('/complaint-categories', complaintCategoryRoutes);
router.use('/telegram-notifications', telegramNotificationRoutes);
router.use('/telegram', telegramRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);
router.use('/connection-logs', connectionLogRoutes);
router.use('/cmo', cmoRoutes);

module.exports = router;