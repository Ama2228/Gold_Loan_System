const reportsService = require('../services/reports.service');

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

    const result = await reportsService.getDailyReport(
      date,
      branch || 'ALL'
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

    const result = await reportsService.getMonthlyReport(
      month,
      branch || 'ALL'
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

    const result = await reportsService.getAuctionReport(
      branch || 'ALL',
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

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getAuctionReport
};
