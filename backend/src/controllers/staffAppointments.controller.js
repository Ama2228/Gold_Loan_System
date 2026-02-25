/**
 * Staff appointments controller
 * GET /api/v1/staff/appointments - List appointments
 * PATCH /api/v1/staff/appointments/:id - Update status (approve/complete/cancel)
 * GET /api/v1/staff/appointments/branches - Get branches for filter
 */

const staffAppointmentsService = require('../services/staffAppointments.service');

/**
 * @route   GET /api/v1/staff/appointments
 * @desc    List appointments for staff (filtered by branch for STAFF, all for MANAGER)
 * @access  Private (Staff, Manager)
 */
const getStaffAppointments = async (req, res) => {
  try {
    const branchId = req.query.branch_id ? parseInt(req.query.branch_id, 10) : null;
    const date = req.query.date || null;
    const status = (req.query.status || 'all').toLowerCase();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    const staffContext = {
      user_id: req.user.user_id,
      branch_id: req.user.branch_id || null,
      roles: req.user.roles || [],
    };

    const result = await staffAppointmentsService.listStaffAppointments(
      { branchId, date, status, page, limit },
      staffContext
    );

    return res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get staff appointments error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve appointments',
    });
  }
};

/**
 * @route   PATCH /api/v1/staff/appointments/:appointmentId
 * @desc    Update appointment status (APPROVE, COMPLETE, CANCEL)
 * @access  Private (Staff, Manager)
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId, 10);
    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID',
      });
    }

    const { action, note } = req.body;
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'action is required (COMPLETE or CANCEL)',
      });
    }

    const staffId = req.user.user_id;
    const updated = await staffAppointmentsService.updateAppointmentStatus(
      appointmentId,
      { action: action.toUpperCase(), note },
      staffId
    );

    return res.json({
      success: true,
      message: `Appointment ${action.toLowerCase()}d successfully`,
      data: updated,
    });
  } catch (error) {
    console.error('Update appointment status error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to update appointment',
    });
  }
};

/**
 * @route   GET /api/v1/staff/appointments/branches
 * @desc    Get active branches for filter dropdown
 * @access  Private (Staff, Manager)
 */
const getBranches = async (req, res) => {
  try {
    const branches = await staffAppointmentsService.getBranchesForFilter();
    return res.json({
      success: true,
      data: branches,
    });
  } catch (error) {
    console.error('Get branches error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve branches',
    });
  }
};

module.exports = {
  getStaffAppointments,
  updateAppointmentStatus,
  getBranches,
};
