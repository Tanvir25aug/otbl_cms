const express = require('express');
const router = express.Router();
const {
  getProfile,
  getMe,
  updateMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProjects,
  updateUserProjects
} = require('../controllers/userController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All routes in this file are protected by default
router.use(protect);

// Route for the logged-in user's extended profile
router.route('/profile').get(getProfile);

// Routes for the logged-in user's own profile
router.route('/me')
  .get(getMe)
  .put(updateMe);

// Admin-only routes for managing all users
router.route('/')
  .get(hasRole('Super Admin', 'Admin'), getUsers)
  .post(hasRole('Super Admin', 'Admin'), createUser);

router.route('/:id')
  .put(hasRole('Super Admin', 'Admin'), updateUser)
  .delete(hasRole('Super Admin'), deleteUser);

// Project assignment routes for users
router.route('/:id/projects')
  .get(hasRole('Super Admin', 'Admin'), getUserProjects)
  .put(hasRole('Super Admin', 'Admin'), updateUserProjects);

module.exports = router;