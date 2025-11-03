const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketCount,
  assignTicket,
  assignProject,
  linkTickets,
  unlinkTickets,
  addWatcher,
  removeWatcher,
  logTime,
  getTimeLogs,
  getTicketHistory,
  toggleFlag,
  archiveTicket,
  assignToMe,
  markUrgent,
  closeTicket,
  reopenTicket,
  cloneTicket,
  changeStatus
} = require('../controllers/ticketController');
const { addComment, getCommentsByTicketId } = require('../controllers/commentController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/tickets'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// All ticket routes are protected
router.use(protect);

router.route('/count')
    .get(hasRole('Super Admin', 'Admin', 'Manager'), getTicketCount);

router.route('/')
  .get(hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), getAllTickets)
  .post(upload.array('files', 10), createTicket); // All authenticated users can create tickets with file uploads

router.route('/:id')
  .get(getTicketById) // Logic to check ownership should be in the controller
  .put(hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), updateTicket)
  .patch(hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), updateTicket)
  .delete(hasRole('Super Admin', 'Admin', 'Manager'), deleteTicket);

// Comment routes
router.route('/:id/comments')
    .get(getCommentsByTicketId)
    .post(upload.array('files', 10), addComment);

// Assignment and linking
router.put('/:id/assign', hasRole('Super Admin', 'Admin', 'Manager'), assignTicket);
router.put('/:id/assign-project', hasRole('Super Admin', 'Admin', 'Manager'), assignProject);
router.post('/:id/link', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), linkTickets);
router.post('/:id/unlink', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), unlinkTickets);

// Watchers
router.post('/:id/watchers', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), addWatcher);
router.delete('/:id/watchers', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), removeWatcher);

// Time tracking
router.post('/:id/log-time', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), logTime);
router.get('/:id/time-logs', getTimeLogs);

// History
router.get('/:id/history', getTicketHistory);

// Flag and Archive
router.post('/:id/flag', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), toggleFlag);
router.post('/:id/archive', hasRole('Super Admin', 'Admin', 'Manager'), archiveTicket);

// Quick Actions
router.post('/:id/assign-to-me', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), assignToMe);
router.post('/:id/mark-urgent', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), markUrgent);
router.post('/:id/close', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), closeTicket);
router.post('/:id/reopen', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), reopenTicket);
router.post('/:id/clone', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), cloneTicket);
router.patch('/:id/status', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), changeStatus);

module.exports = router;
