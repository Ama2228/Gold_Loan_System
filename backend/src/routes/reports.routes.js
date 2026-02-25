const express = require('express');
const { authenticate: protect } = require('../../middleware/auth');
const { authorize: requireRole } = require('../../middleware/auth');
const {
  getDailyReport,
  getMonthlyReport,
  getAuctionReport
} = require('../controllers/reports.controller');

const router = express.Router();

// Apply protect and ADMIN role requirement to all routes
router.use(protect);
router.use(requireRole('STAFF', 'MANAGER', 'ADMIN'));

// @route   GET /daily
// @desc    Get daily transactions report
// @access  Private/Admin
router.get('/daily', getDailyReport);

// @route   GET /monthly
// @desc    Get monthly summary report
// @access  Private/Admin
router.get('/monthly', getMonthlyReport);

// @route   GET /auction
// @desc    Get auction candidates report
// @access  Private/Admin
router.get('/auction', getAuctionReport);

module.exports = router;
