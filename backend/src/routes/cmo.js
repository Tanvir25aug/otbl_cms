const express = require('express');
const router = express.Router();
const { getCMOs, getCMOStatistics, checkMDMEntry, exportCMOData } = require('../controllers/cmoController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All CMO routes require authentication
router.use(protect);

// GET /api/cmo/statistics — must be before any /:id route
router.get('/statistics', hasRole('Super Admin', 'Admin'), getCMOStatistics);

// POST /api/cmo/check-mdm-entry — check all CMO records against Customer DB
router.post('/check-mdm-entry', hasRole('Super Admin', 'Admin'), checkMDMEntry);

// GET /api/cmo/export — export all CMO records with Customer data
router.get('/export', hasRole('Super Admin', 'Admin'), exportCMOData);

// GET /api/cmo — list all CMOs with filtering/pagination
router.get('/', hasRole('Super Admin', 'Admin'), getCMOs);

module.exports = router;
