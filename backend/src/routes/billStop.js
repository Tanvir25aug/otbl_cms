const express = require('express');
const router = express.Router();
const multer = require('multer');
const billStopController = require('../controllers/billStopController');
const billStopSnapshotController = require('../controllers/billStopSnapshotController');
const { protect, hasRole } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Upload and analyze CSV file
router.post('/upload-and-analyze', protect, upload.single('file'), billStopController.uploadAndAnalyze);

// Get bill stop analysis for specific customer/meter
router.get('/analyze', protect, billStopController.getBillStopAnalysis);

// Get bill stop report (also triggers snapshot save to OTBL_CMS SQL Server)
router.get('/report', protect, billStopController.getBillStopReport);

router.get('/customers', protect, billStopController.getBillStopCustomers);

// Snapshot endpoints (saved data from OTBL_CMS SQL Server)
router.get('/snapshot', protect, billStopSnapshotController.getSnapshot);
router.get('/snapshot/summary', protect, billStopSnapshotController.getSnapshotSummary);

module.exports = router;
