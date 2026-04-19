const { pool } = require('../../config/database');
const managerService = require('../services/manager.service');
const reversePawningService = require('../services/reversePawning.service');

/**
 * @route   GET /api/v1/manager/dashboard
 * @access  Private / Manager
 */
async function getDashboard(req, res) {
  try {
    const branchId = req.user.branch_id;
    const { from, to } = req.query;
    const stats = await managerService.getDashboardStats(branchId, { from, to });
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load dashboard'
    });
  }
}

/**
 * @route   GET /api/v1/manager/reverse-pawning
 * @access  Private / Manager
 */
async function getReversePawningList(req, res) {
  try {
    const branchId = req.user.branch_id;
    const list = await reversePawningService.listRequests(branchId);
    let branchName = '';
    if (branchId) {
      const [rows] = await pool.query(
        'SELECT branch_code, branch_name FROM branches WHERE branch_id = ?',
        [branchId]
      );
      branchName = rows[0] ? `${rows[0].branch_code} - ${rows[0].branch_name}` : '';
    }
    res.json({
      success: true,
      data: { list, branchName }
    });
  } catch (error) {
    console.error('Reverse pawning list error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load reverse pawning list'
    });
  }
}

/**
 * @route   POST /api/v1/manager/reverse-pawning
 * @access  Private / Manager
 */
async function createReversePawning(req, res) {
  try {
    const managerStaffId = req.user.user_id;
    const branchId = req.user.branch_id;
    const { receiptNo, reason } = req.body || {};

    const result = await reversePawningService.createRequest(
      managerStaffId,
      branchId,
      { receiptNo, reason }
    );

    res.status(201).json({
      success: true,
      message: 'Reverse pawning request created',
      data: result
    });
  } catch (error) {
    console.error('Create reverse pawning error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create reverse pawning'
    });
  }
}

/**
 * @route   PATCH /api/v1/manager/reverse-pawning/:reverseId/approve
 * @access  Private / Manager
 */
async function approveReversePawning(req, res) {
  try {
    const managerStaffId = req.user.user_id;
    const branchId = req.user.branch_id;
    const { reverseId } = req.params;

    const result = await reversePawningService.reviewRequest(
      managerStaffId,
      branchId,
      reverseId,
      'APPROVED'
    );

    res.json({
      success: true,
      message: 'Reverse pawning approved',
      data: result
    });
  } catch (error) {
    console.error('Approve reverse pawning error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to approve reverse pawning'
    });
  }
}

/**
 * @route   PATCH /api/v1/manager/reverse-pawning/:reverseId/reject
 * @access  Private / Manager
 */
async function rejectReversePawning(req, res) {
  try {
    const managerStaffId = req.user.user_id;
    const branchId = req.user.branch_id;
    const { reverseId } = req.params;

    const result = await reversePawningService.reviewRequest(
      managerStaffId,
      branchId,
      reverseId,
      'REJECTED'
    );

    res.json({
      success: true,
      message: 'Reverse pawning rejected',
      data: result
    });
  } catch (error) {
    console.error('Reject reverse pawning error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject reverse pawning'
    });
  }
}

module.exports = {
  getDashboard,
  getReversePawningList,
  createReversePawning,
  approveReversePawning,
  rejectReversePawning
};
