const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(protect);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get organization-wide analytics dashboard
 * @access  Manager, Admin, Super Admin
 */
router.get('/dashboard', hasRole('Manager', 'Admin', 'Super Admin'), analyticsController.getDashboardAnalytics);

/**
 * @route   GET /api/analytics/projects/:id
 * @desc    Get comprehensive project analytics
 * @access  Manager, Admin, Super Admin
 */
router.get('/projects/:id', hasRole('Manager', 'Admin', 'Super Admin'), analyticsController.getProjectAnalytics);

/**
 * @route   GET /api/analytics/teams/:id
 * @desc    Get team analytics and performance metrics
 * @access  Manager, Admin, Super Admin (or team members)
 */
router.get('/teams/:id', hasRole('Manager', 'Admin', 'Super Admin', 'Agent'), analyticsController.getTeamAnalytics);

/**
 * @route   GET /api/analytics/sprints/:id
 * @desc    Get sprint analytics with burndown chart data
 * @access  Manager, Admin, Super Admin, Agent
 */
router.get('/sprints/:id', hasRole('Manager', 'Admin', 'Super Admin', 'Agent'), analyticsController.getSprintAnalytics);

/**
 * @route   GET /api/analytics/users/:id
 * @desc    Get user performance analytics
 * @access  Authenticated users (can view own or if Manager+)
 */
router.get('/users/:id', analyticsController.getUserAnalytics);

module.exports = router;
