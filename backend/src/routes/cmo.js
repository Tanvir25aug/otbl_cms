const express = require('express');
const router = express.Router();
const { getCMOs, getCMOStatistics } = require('../controllers/cmoController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All CMO routes require authentication
router.use(protect);

// GET /api/cmo/statistics — must be before any /:id route
router.get('/statistics', hasRole('Super Admin', 'Admin'), getCMOStatistics);

// GET /api/cmo — list all CMOs with filtering/pagination
router.get('/', hasRole('Super Admin', 'Admin'), getCMOs);

module.exports = router;
