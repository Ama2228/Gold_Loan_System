const customerService = require('../../src/services/customer.service');
const paymentsService = require('../../src/services/payments.service');
const customerAppointmentsService = require('../../src/services/customerAppointments.service');
const customerNotificationsService = require('../../src/services/customerNotifications.service');

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private (Staff, Manager, Admin)
const getAllCustomers = async (req, res) => {
  try {
    console.log('📋 Fetching all customers');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await customerService.getAllCustomers(page, limit);

    res.json({
      success: true,
      message: 'Customers retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customers',
      error: error.message
    });
  }
};

// @desc    Get customer by ID
// @route   GET /api/v1/customers/:customerId
// @access  Private
const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log('🔍 Fetching customer:', customerId);

    const result = await customerService.getCustomerById(customerId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      message: 'Customer retrieved successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customer',
      error: error.message
    });
  }
};

// @desc    Create new customer
// @route   POST /api/v1/customers
// @access  Private (Staff, Manager, Admin)
const createCustomer = async (req, res) => {
  try {
    const { nic, fullName, email, mobileNumber, addressLine1, addressLine2, city } = req.body;

    // Validate required fields
    if (!nic || !fullName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'NIC, full name, and mobile number are required'
      });
    }

    console.log('➕ Creating new customer:', fullName);

    const result = await customerService.createCustomer({
      nic,
      fullName,
      email,
      mobileNumber,
      addressLine1,
      addressLine2,
      city
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/v1/customers/:customerId
// @access  Private (Staff, Manager, Admin)
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { fullName, email, mobileNumber, addressLine1, addressLine2, city } = req.body;

    if (!fullName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name and mobile number are required'
      });
    }

    console.log('✏️  Updating customer:', customerId);

    const result = await customerService.updateCustomer(customerId, {
      fullName,
      email,
      mobileNumber,
      addressLine1,
      addressLine2,
      city
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('❌ Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/v1/customers/:customerId
// @access  Private (Admin, Manager)
const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log('🗑️  Deleting customer:', customerId);

    const result = await customerService.deleteCustomer(customerId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('❌ Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// @desc    Search customers
// @route   GET /api/v1/customers/search/:query
// @access  Private
const searchCustomers = async (req, res) => {
  try {
    const { query } = req.params;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    console.log('🔎 Searching customers:', query);

    const result = await customerService.searchCustomers(query);

    res.json({
      success: true,
      message: 'Search completed',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching customers',
      error: error.message
    });
  }
};

// ========================================================
// CUSTOMER-FACING ENDPOINTS (for logged-in customers)
// ========================================================

// @desc    Get customer dashboard with stats and recent transactions
// @route   GET /api/customer/dashboard
// @access  Private (Customer only)
const getCustomerDashboard = async (req, res) => {
  try {
    // Extract customer ID from JWT payload
    const customerId = req.user.user_id;
    
    console.log('📊 Dashboard request - Customer ID:', customerId);

    // Call service function
    const result = await customerService.getDashboard(customerId);

    // Handle not found
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || 'Customer not found'
      });
    }

    // Return success response
    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get customer's receipts/pawn tickets
// @route   GET /api/customer/receipts?page=1&limit=10
// @access  Private (Customer only)
const getCustomerReceipts = async (req, res) => {
  try {
    // Extract customer ID from JWT payload
    const customerId = req.user.user_id;

    console.log('📋 Receipts request - Customer ID:', customerId);

    // Call service function
    const result = await customerService.getReceipts(customerId);

    // Handle errors
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || 'No receipts found'
      });
    }

    // Return success response
    res.json({
      success: true,
      message: 'Receipts retrieved successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Get receipts error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving receipts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Process customer part payment
// @route   POST /api/customer/tickets/:ticketId/part-payment
// @access  Private (Customer only)
const processCustomerPartPayment = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const ticketId = parseInt(req.params.ticketId, 10);

    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    const { amount, paymentMethod, note } = req.body;
    const result = await paymentsService.processPartPaymentForCustomer(
      ticketId,
      { amount, paymentMethod: paymentMethod || 'ONLINE', note },
      customerId
    );

    return res.status(201).json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (error) {
    console.error('Customer part payment error:', error.message);
    if (error.message?.includes('not found') || error.message?.includes('access denied')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message?.includes('cannot exceed') || error.message?.includes('greater than 0')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to process part payment',
      error: error.message
    });
  }
};

// @desc    Get customer's own profile
// @route   GET /api/customer/profile
// @access  Private (Customer only)
const getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const result = await customerService.getCustomerById(customerId);
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }
    return res.json({
      success: true,
      message: 'Profile retrieved',
      data: result.data
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// @desc    Update customer's own profile
// @route   PUT /api/customer/profile
// @access  Private (Customer only)
const updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const profileResult = await customerService.getCustomerById(customerId);
    if (!profileResult.success) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    const current = profileResult.data;
    const { fullName, email, mobileNumber, addressLine1, addressLine2, city } = req.body;
    const result = await customerService.updateCustomer(customerId, {
      fullName: fullName ?? current.full_name,
      email: email ?? current.email ?? '',
      mobileNumber: mobileNumber ?? current.mobile_number ?? '',
      addressLine1: addressLine1 ?? current.address_line1 ?? '',
      addressLine2: addressLine2 ?? current.address_line2 ?? '',
      city: city ?? current.city ?? ''
    });
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    return res.json({
      success: true,
      message: result.message || 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Get customer's appointments
// @route   GET /api/customer/appointments
// @access  Private (Customer only)
const getCustomerAppointments = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const appointments = await customerAppointmentsService.getCustomerAppointments(customerId);
    return res.json({
      success: true,
      message: 'Appointments retrieved',
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};

// @desc    Create customer appointment
// @route   POST /api/customer/appointments
// @access  Private (Customer only)
const createCustomerAppointment = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const { ticket_id, branch_id, purpose, appointment_date, time_slot_start, time_slot_end } = req.body;
    if (!ticket_id || !branch_id || !purpose || !appointment_date) {
      return res.status(400).json({
        success: false,
        message: 'ticket_id, branch_id, purpose, and appointment_date are required'
      });
    }
    const result = await customerAppointmentsService.createCustomerAppointment(customerId, {
      ticket_id,
      branch_id,
      purpose,
      appointment_date,
      time_slot_start: time_slot_start || '09:00:00',
      time_slot_end: time_slot_end || '09:30:00'
    });
    return res.status(201).json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (error) {
    console.error('Create appointment error:', error.message);
    if (error.message?.includes('not found') || error.message?.includes('eligible')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// @desc    Get slot availability for a branch and date
// @route   GET /api/customer/appointments/slot-availability?branch_id=&date=
// @access  Private (Customer only)
const getSlotAvailability = async (req, res) => {
  try {
    const branchId = parseInt(req.query.branch_id, 10);
    const date = req.query.date;
    if (!branchId || !date) {
      return res.status(400).json({
        success: false,
        message: 'branch_id and date query parameters are required'
      });
    }
    const slots = await customerAppointmentsService.getSlotAvailability(branchId, date);
    return res.json({
      success: true,
      message: 'Slot availability retrieved',
      data: slots
    });
  } catch (error) {
    console.error('Get slot availability error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get slot availability',
      error: error.message
    });
  }
};

// @desc    Get branches list (for appointment booking)
// @route   GET /api/customer/branches
// @access  Private (Customer only)
const getCustomerBranches = async (req, res) => {
  try {
    const branches = await customerAppointmentsService.getBranches();
    return res.json({
      success: true,
      message: 'Branches retrieved',
      data: branches
    });
  } catch (error) {
    console.error('Get branches error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get branches',
      error: error.message
    });
  }
};

// @desc    Get customer notifications (aggregated)
// @route   GET /api/customer/notifications
// @access  Private (Customer only)
const getCustomerNotifications = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const notifications = await customerNotificationsService.getCustomerNotifications(customerId);
    return res.json({
      success: true,
      message: 'Notifications retrieved',
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

// @desc    Get single receipt detail with transaction history
// @route   GET /api/customer/receipts/:receiptNo
// @access  Private (Customer only)
const getCustomerReceiptDetail = async (req, res) => {
  try {
    // Extract customer ID from JWT payload
    const customerId = req.user.user_id;
    const { receiptNo } = req.params;

    console.log('🔍 Receipt detail - Receipt No:', receiptNo, '| Customer ID:', customerId);

    // Validate receipt number
    if (!receiptNo) {
      return res.status(400).json({
        success: false,
        message: 'Receipt number is required'
      });
    }

    // Call service function (service verifies ownership)
    const result = await customerService.getReceiptDetail(customerId, receiptNo);

    // Return 404 if receipt not found or not owned by customer
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || 'Receipt not found or access denied'
      });
    }

    // Return success response
    res.json({
      success: true,
      message: 'Receipt details retrieved successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Get receipt detail error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Log OTP for dev/testing (prints OTP in backend console)
// @route   POST /api/customer/otp/log
// @access  Private (Customer only)
const logOtp = async (req, res) => {
  try {
    const { purpose, otp } = req.body;
    const label = purpose || 'OTP';
    console.log(`[OTP] ${label}: ${otp || '(empty)'}`);
    return res.json({ success: true });
  } catch (error) {
    console.error('Log OTP error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to log OTP',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  // Customer-facing endpoints
  getCustomerDashboard,
  getCustomerReceipts,
  getCustomerReceiptDetail,
  processCustomerPartPayment,
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerAppointments,
  createCustomerAppointment,
  getSlotAvailability,
  getCustomerBranches,
  getCustomerNotifications,
  logOtp
};
