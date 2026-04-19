const reportsService = require('../services/reports.service');
const { pool } = require('../../config/database');

/**
 * Resolve effective branch for reports based on user role.
 * STAFF: forced to their branch; MANAGER/ADMIN: use query param.
 */
async function resolveReportBranch(req, branchParam) {
  const roles = req.user?.roles || [];
  const isStaff = roles.includes('STAFF');
  const isManager = roles.includes('MANAGER');
  const isAdmin = roles.includes('ADMIN');

  if (isStaff) {
    const branchId = req.user?.branch_id;
    if (!branchId) {
      return { branch: null, error: 'Staff must be assigned to a branch' };
    }
    const [[row]] = await pool.query(
      'SELECT branch_code FROM branches WHERE branch_id = ?',
      [branchId]
    );
    if (!row) {
      return { branch: null, error: 'Branch not found' };
    }
    return { branch: row.branch_code };
  }

  return { branch: branchParam || 'ALL' };
}

// @desc    Get daily report
// @route   GET /api/v1/reports/daily
// @access  Private/Admin
const getDailyReport = async (req, res, next) => {
  try {
    console.log('📊 Generating daily report');
    const { date, branch } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date query parameter is required (YYYY-MM-DD format)'
      });
    }

    const { branch: effectiveBranch, error: branchError } = await resolveReportBranch(req, branch);
    if (branchError) {
      return res.status(403).json({ success: false, message: branchError });
    }

    const result = await reportsService.getDailyReport(
      date,
      effectiveBranch || 'ALL'
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Daily report generated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get daily report error:', error);
    next(error);
  }
};

// @desc    Get monthly report
// @route   GET /api/v1/reports/monthly
// @access  Private/Admin
const getMonthlyReport = async (req, res, next) => {
  try {
    console.log('📈 Generating monthly report');
    const { month, branch } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'month query parameter is required (YYYY-MM format)'
      });
    }

    const { branch: effectiveBranch, error: branchError } = await resolveReportBranch(req, branch);
    if (branchError) {
      return res.status(403).json({ success: false, message: branchError });
    }

    const result = await reportsService.getMonthlyReport(
      month,
      effectiveBranch || 'ALL'
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Monthly report generated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get monthly report error:', error);
    next(error);
  }
};

// @desc    Get auction report
// @route   GET /api/v1/reports/auction
// @access  Private/Admin
const getAuctionReport = async (req, res, next) => {
  try {
    console.log('🔨 Generating auction report');
    const { branch, status, overdueDays } = req.query;

    const { branch: effectiveBranch, error: branchError } = await resolveReportBranch(req, branch);
    if (branchError) {
      return res.status(403).json({ success: false, message: branchError });
    }

    const result = await reportsService.getAuctionReport(
      effectiveBranch || 'ALL',
      status || 'ALL',
      parseInt(overdueDays) || 0
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Auction report generated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get auction report error:', error);
    next(error);
  }
};

// @desc    Get reminder status logs
// @route   GET /api/v1/reports/reminders/status
// @access  Private/Staff/Manager/Admin
const getReminderStatus = async (req, res, next) => {
  try {
    const { branch, limit } = req.query;

    const { branch: effectiveBranch, error: branchError } = await resolveReportBranch(req, branch);
    if (branchError) {
      return res.status(403).json({ success: false, message: branchError });
    }

    const result = await reportsService.getReminderStatus(effectiveBranch || 'ALL', parseInt(limit, 10) || 100);

    res.json({
      success: true,
      message: 'Reminder status retrieved successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get reminder status error:', error);
    next(error);
  }
};

// @desc    Send due reminders (email + in-app fallback while SMS gateway is pending)
// @route   POST /api/v1/reports/reminders/send
// @access  Private/Staff/Manager/Admin
const sendRemindersNow = async (req, res, next) => {
  try {
    const { branch, receiptNo } = req.body || {};

    const { branch: effectiveBranch, error: branchError } = await resolveReportBranch(req, branch);
    if (branchError) {
      return res.status(403).json({ success: false, message: branchError });
    }

    const result = await reportsService.sendReminderMessages(effectiveBranch || 'ALL', receiptNo || null);

    res.json({
      success: true,
      message: 'Reminder dispatch completed',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Send reminders error:', error);
    next(error);
  }
};

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getAuctionReport,
  getReminderStatus,
  sendRemindersNow
};
