const customerDashboardService = require('../../src/services/customerDashboard.service');

// @desc    Get customer dashboard summary with stats
// @route   GET /api/v1/customer/dashboard
// @access  Private (Customer only)
// @logic   Extract user_id from JWT, call service, return dashboard data
const getDashboardSummary = async (req, res) => {
  try {
    // Read customer user_id from JWT payload
    const customerId = req.user.userId;
    
    console.log('📊 Dashboard request for customer:', customerId, 'NIC:', req.user.nic);

    // Validate customer ID
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID not found in token'
      });
    }

    // Call service function
    const result = await customerDashboardService.getDashboardSummary(customerId);

    // Handle not found
    if (!result.success) {
      console.log('❌ Customer not found:', customerId);
      return res.status(404).json({
        success: false,
        message: result.message || 'Customer not found'
      });
    }

    // Return successful response
    console.log('✅ Dashboard retrieved successfully');
    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get customer's receipts/pawn tickets (paginated)
// @route   GET /api/v1/customer/receipts?page=1&limit=10
// @access  Private (Customer only)
// @logic   Extract user_id from JWT, get pagination params, call service, return list
const getMyReceipts = async (req, res) => {
  try {
    // Read customer user_id from JWT payload
    const customerId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    console.log('📋 Receipts request for customer:', customerId, 'Page:', page, 'Limit:', limit);

    // Validate customer ID
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID not found in token'
      });
    }

    // Validate pagination params
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page and limit must be greater than 0'
      });
    }

    // Call service function
    const result = await customerDashboardService.getReceipts(customerId, page, limit);

    // Handle errors
    if (!result.success) {
      console.log('❌ Error fetching receipts:', result.message);
      return res.status(404).json({
        success: false,
        message: result.message || 'Receipts not found'
      });
    }

    // Return successful response with pagination
    console.log('✅ Receipts retrieved successfully. Total:', result.pagination.total);
    res.json({
      success: true,
      message: 'Receipts retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ Get receipts error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving receipts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single receipt detail with transaction history
// @route   GET /api/v1/customer/receipts/:receiptNo
// @access  Private (Customer only)
// @logic   Extract user_id from JWT, get receipt param, verify ownership, call service
const getReceiptDetail = async (req, res) => {
  try {
    // Read customer user_id from JWT payload
    const customerId = req.user.userId;
    const { receiptNo } = req.params;

    console.log('🔍 Receipt detail request for:', receiptNo, 'by customer:', customerId);

    // Validate inputs
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID not found in token'
      });
    }

    if (!receiptNo || receiptNo.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Receipt number is required'
      });
    }

    // Call service function (service verifies ownership)
    const result = await customerDashboardService.getReceiptByNo(customerId, receiptNo);

    // Handle not found
    if (!result.success) {
      console.log('❌ Receipt not found:', receiptNo);
      return res.status(404).json({
        success: false,
        message: result.message || 'Receipt not found'
      });
    }

    // Return successful response with receipt and history
    console.log('✅ Receipt detail retrieved successfully');
    res.json({
      success: true,
      message: 'Receipt retrieved successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Get receipt detail error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardSummary,
  getMyReceipts,
  getReceiptDetail
};
