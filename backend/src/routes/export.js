const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All export routes require authentication
router.use(protect);

/**
 * @route   GET /api/export/project/:id/pdf
 * @desc    Export project analytics to PDF
 * @access  Manager, Admin, Super Admin
 */
router.get('/project/:id/pdf', hasRole('Manager', 'Admin', 'Super Admin'), exportController.exportProjectPDF);

/**
 * @route   GET /api/export/project/:id/csv
 * @desc    Export project analytics to CSV
 * @access  Manager, Admin, Super Admin
 */
router.get('/project/:id/csv', hasRole('Manager', 'Admin', 'Super Admin'), exportController.exportProjectCSV);

/**
 * @route   GET /api/export/team/:id/pdf
 * @desc    Export team analytics to PDF
 * @access  Manager, Admin, Super Admin
 */
router.get('/team/:id/pdf', hasRole('Manager', 'Admin', 'Super Admin'), exportController.exportTeamPDF);

/**
 * @route   GET /api/export/sprint/:id/pdf
 * @desc    Export sprint analytics to PDF
 * @access  Manager, Admin, Super Admin, Agent
 */
router.get('/sprint/:id/pdf', hasRole('Manager', 'Admin', 'Super Admin', 'Agent'), exportController.exportSprintPDF);

/**
 * @route   GET /api/export/ticket/:id/pdf
 * @desc    Export ticket details to PDF
 * @access  All authenticated users
 */
router.get('/ticket/:id/pdf', exportController.exportTicketPDF);

module.exports = router;
