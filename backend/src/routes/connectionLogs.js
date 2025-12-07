const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  getConnectionAnalytics,
  getRecentConnectionLogs,
  getUserConnectionHistory,
  uploadRCDCData,
  uploadRCDCDataJSON,
  downloadTemplate,
  deleteAllConnectionLogs
} = require('../controllers/connectionLogController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All routes require authentication
router.use(protect);

// Download Excel template
router.get('/template', downloadTemplate);

// Upload RC/DC data from Excel
router.post('/upload', upload.single('file'), uploadRCDCData);

// Upload RC/DC data from JSON (API)
router.post('/upload-json', uploadRCDCDataJSON);

// Delete all connection logs
router.delete('/delete-all', deleteAllConnectionLogs);

// Get connection analytics overview
router.get('/analytics', getConnectionAnalytics);

// Get recent connection logs
router.get('/', getRecentConnectionLogs);

// Get user connection history
router.get('/user/:userId', getUserConnectionHistory);

module.exports = router;
