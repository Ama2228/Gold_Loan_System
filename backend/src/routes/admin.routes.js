const express = require('express');
const { authenticate: protect } = require('../../middleware/auth');
const { authorize: requireRole } = require('../../middleware/auth');
const { getDashboard, getBranches, createBranch, updateBranch, getBranchOpeningHours, updateBranchOpeningHours, getOccupations, createOccupation, updateOccupation, deleteOccupation, getPawningPeriods, createPawningPeriod, updatePawningPeriod, getTimeSlots, updateTimeSlot, generateDefaultTimeSlots, getKaratAdvanceRates, updateKaratAdvanceRate, getSystemSettings, updateSystemSetting } = require('../controllers/admin.controller');
const { getStaff, createStaff, updateStaff, toggleStaffStatus } = require('../controllers/adminStaff.controller');

const router = express.Router();

// Apply protect and ADMIN role requirement to all routes
router.use(protect);
router.use(requireRole('ADMIN'));

// @route   GET /dashboard
// @desc    Get admin dashboard overview
// @access  Private/Admin
router.get('/dashboard', getDashboard);

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

// @route   GET /branches/:branchId/opening-hours
// @desc    Get branch opening hours
// @access  Private/Admin
router.get('/branches/:branchId/opening-hours', getBranchOpeningHours);

// @route   PUT /branches/:branchId/opening-hours
// @desc    Update branch opening hours
// @access  Private/Admin
router.put('/branches/:branchId/opening-hours', updateBranchOpeningHours);

// @route   GET /occupations
// @desc    Get all occupations
// @access  Private/Admin
router.get('/occupations', getOccupations);

// @route   POST /occupations
// @desc    Create a new occupation
// @access  Private/Admin
router.post('/occupations', createOccupation);

// @route   PUT /occupations/:occupationId
// @desc    Update an occupation
// @access  Private/Admin
router.put('/occupations/:occupationId', updateOccupation);

// @route   DELETE /occupations/:occupationId
// @desc    Delete an occupation
// @access  Private/Admin
router.delete('/occupations/:occupationId', deleteOccupation);

// @route   GET /pawning-periods
// @desc    Get all pawning periods
// @access  Private/Admin
router.get('/pawning-periods', getPawningPeriods);

// @route   POST /pawning-periods
// @desc    Create a new pawning period
// @access  Private/Admin
router.post('/pawning-periods', createPawningPeriod);

// @route   PUT /pawning-periods/:periodId
// @desc    Update a pawning period
// @access  Private/Admin
router.put('/pawning-periods/:periodId', updatePawningPeriod);

// @route   GET /time-slots
// @desc    Get all time slots
// @access  Private/Admin
router.get('/time-slots', getTimeSlots);

// @route   PUT /time-slots/:slotId
// @desc    Update a time slot
// @access  Private/Admin
router.put('/time-slots/:slotId', updateTimeSlot);

// @route   POST /time-slots/generate
// @desc    Generate default time slots
// @access  Private/Admin
router.post('/time-slots/generate', generateDefaultTimeSlots);

// @route   GET /karat-advance-rates
// @desc    Get all karat advance rates
// @access  Private/Admin
router.get('/karat-advance-rates', getKaratAdvanceRates);

// @route   PUT /karat-advance-rates/:karat
// @desc    Update karat advance rate
// @access  Private/Admin
router.put('/karat-advance-rates/:karat', updateKaratAdvanceRate);

// @route   GET /settings
// @desc    Get all system settings
// @access  Private/Admin
router.get('/settings', getSystemSettings);

// @route   PUT /settings/:key
// @desc    Update system setting
// @access  Private/Admin
router.put('/settings/:key', updateSystemSetting);

// =========================================================
// STAFF MANAGEMENT ROUTES
// =========================================================

// @route   GET /staff
// @desc    Get all staff with pagination
// @access  Private/Admin
router.get('/staff', getStaff);

// @route   POST /staff
// @desc    Create a new staff account
// @access  Private/Admin
router.post('/staff', createStaff);

// @route   PUT /staff/:staffId
// @desc    Update staff profile
// @access  Private/Admin
router.put('/staff/:staffId', updateStaff);

// @route   PATCH /staff/:staffId/status
// @desc    Toggle staff status (ACTIVE <-> INACTIVE)
// @access  Private/Admin
router.patch('/staff/:staffId/status', toggleStaffStatus);

module.exports = router;
