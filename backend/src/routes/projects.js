const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get user's assigned projects (must be before /:id routes)
router.get('/my-projects', projectController.getMyProjects);

// Get all projects (Admin/SuperAdmin see all, others see assigned)
router.get('/', projectController.getProjects);

// Get single project
router.get('/:id', projectController.getProjectById);

// Get project statistics
router.get('/:id/stats', projectController.getProjectStats);

// Create project
router.post('/', hasRole('Manager', 'Admin', 'Super Admin'), projectController.createProject);

// Update project
router.put('/:id', hasRole('Manager', 'Admin', 'Super Admin'), projectController.updateProject);

// Delete project
router.delete('/:id', hasRole('Admin', 'Super Admin'), projectController.deleteProject);

// ======= PROJECT MEMBERSHIP ROUTES =======

// Get project members
router.get('/:id/members', projectController.getProjectMembers);

// Add member to project
router.post('/:id/members', hasRole('Admin', 'Super Admin'), projectController.addProjectMember);

// Bulk add members to project
router.post('/:id/members/bulk', hasRole('Admin', 'Super Admin'), projectController.bulkAddMembers);

// Update member role
router.patch('/:id/members/:userId/role', hasRole('Admin', 'Super Admin'), projectController.updateMemberRole);

// Remove member from project
router.delete('/:id/members/:userId', hasRole('Admin', 'Super Admin'), projectController.removeProjectMember);

module.exports = router;
