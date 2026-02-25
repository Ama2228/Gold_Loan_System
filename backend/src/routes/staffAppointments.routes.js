const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const {
  getStaffAppointments,
  updateAppointmentStatus,
  getBranches,
} = require('../controllers/staffAppointments.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorize('STAFF', 'MANAGER'));

// @route   GET /api/v1/staff/appointments/branches
// @desc    Get branches for filter dropdown
router.get('/branches', getBranches);

// @route   GET /api/v1/staff/appointments
// @desc    List appointments with filters
router.get('/', getStaffAppointments);

// @route   PATCH /api/v1/staff/appointments/:appointmentId
// @desc    Update status (approve/complete/cancel)
router.patch('/:appointmentId', updateAppointmentStatus);

module.exports = router;
