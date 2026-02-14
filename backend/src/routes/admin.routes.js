const express = require('express');
const { authenticate: protect } = require('../../middleware/auth');
const { authorize: requireRole } = require('../../middleware/auth');
const { getBranches, createBranch, updateBranch } = require('../controllers/admin.controller');

const router = express.Router();

// Apply protect and ADMIN role requirement to all routes
router.use(protect);
router.use(requireRole('ADMIN'));

// @route   GET /branches
// @desc    Get all branches
// @access  Private/Admin
router.get('/branches', getBranches);

// @route   POST /branches
// @desc    Create a new branch
// @access  Private/Admin
router.post('/branches', createBranch);

// @route   PUT /branches/:branchId
// @desc    Update a branch
// @access  Private/Admin
router.put('/branches/:branchId', updateBranch);

module.exports = router;
