const express = require('express');
const router = express.Router();
const { getCustomerDashboard, getCustomerReceipts, getCustomerReceiptDetail, processCustomerPartPayment, getCustomerProfile, updateCustomerProfile, getCustomerAppointments, createCustomerAppointment, getSlotAvailability, getCustomerBranches, getCustomerNotifications, logOtp } = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// Protect all routes with JWT authentication
router.use(authenticate);

// Allow only CUSTOMER role
router.use(authorize('CUSTOMER'));

// @route   GET /api/customer/dashboard
// @desc    Get customer dashboard summary with stats
// @access  Private (Customer only)
router.get('/dashboard', getCustomerDashboard);

// @route   GET /api/customer/profile
// @desc    Get customer's own profile
// @access  Private (Customer only)
router.get('/profile', getCustomerProfile);

// @route   PUT /api/customer/profile
// @desc    Update customer's own profile
// @access  Private (Customer only)
router.put('/profile', updateCustomerProfile);

// @route   GET /api/customer/receipts
// @desc    Get customer's receipts/pawn tickets
// @access  Private (Customer only)
router.get('/receipts', getCustomerReceipts);

// @route   GET /api/customer/receipts/:receiptNo
// @desc    Get specific receipt details with history
// @access  Private (Customer only)
router.get('/receipts/:receiptNo', getCustomerReceiptDetail);

// @route   POST /api/customer/tickets/:ticketId/part-payment
// @desc    Customer-initiated part payment
// @access  Private (Customer only)
router.post('/tickets/:ticketId/part-payment', processCustomerPartPayment);

// @route   GET /api/customer/appointments/slot-availability
// @desc    Get slot availability for branch + date
// @access  Private (Customer only)
router.get('/appointments/slot-availability', getSlotAvailability);

// @route   GET /api/customer/appointments
// @desc    List customer's appointments
// @access  Private (Customer only)
router.get('/appointments', getCustomerAppointments);

// @route   POST /api/customer/appointments
// @desc    Create customer appointment
// @access  Private (Customer only)
router.post('/appointments', createCustomerAppointment);

// @route   GET /api/customer/branches
// @desc    List branches (for appointment booking)
// @access  Private (Customer only)
router.get('/branches', getCustomerBranches);

// @route   GET /api/customer/notifications
// @desc    Aggregated notifications (reminders, payments, appointments)
// @access  Private (Customer only)
router.get('/notifications', getCustomerNotifications);

// @route   POST /api/customer/otp/log
// @desc    Log OTP to backend console (dev/testing)
// @access  Private (Customer only)
router.post('/otp/log', logOtp);

module.exports = router;
