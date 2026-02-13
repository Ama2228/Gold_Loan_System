const express = require('express');
const router = express.Router();
const { getCustomerDashboard, getCustomerReceipts, getCustomerReceiptDetail } = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// Protect all routes with JWT authentication
router.use(authenticate);

// Allow only CUSTOMER role
router.use(authorize('CUSTOMER'));

// @route   GET /api/customer/dashboard
// @desc    Get customer dashboard summary with stats
// @access  Private (Customer only)
router.get('/dashboard', getCustomerDashboard);

// @route   GET /api/customer/receipts
// @desc    Get customer's receipts/pawn tickets
// @access  Private (Customer only)
router.get('/receipts', getCustomerReceipts);

// @route   GET /api/customer/receipts/:receiptNo
// @desc    Get specific receipt details with history
// @access  Private (Customer only)
router.get('/receipts/:receiptNo', getCustomerReceiptDetail);

module.exports = router;
