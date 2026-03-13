const customerRatingService = require('../services/customerRating.service');

/**
 * CUSTOMER RATING CONTROLLER
 * Lightweight wrapper around rating service for staff tools.
 */

// @desc    Get customer rating based on historical behavior
// @route   GET /api/v1/staff/customers/:customerId/rating
// @access  Private (STAFF, MANAGER, ADMIN via route middleware)
const getCustomerRating = async (req, res) => {
  try {
    const { customerId } = req.params;

    const id = parseInt(customerId, 10);
    if (!id || Number.isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const rating = await customerRatingService.getCustomerRating(id);

    return res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Get customer rating error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute customer rating',
      error: error.message
    });
  }
};

// @desc    Get customer rating preview for a requested loan amount
// @route   POST /api/v1/staff/customers/:customerId/rating/preview
// @access  Private (STAFF, MANAGER, ADMIN via route middleware)
const getCustomerRatingForRequest = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { requestedAmount } = req.body || {};

    const id = parseInt(customerId, 10);
    if (!id || Number.isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const amount = Number(requestedAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'requestedAmount must be a number greater than 0'
      });
    }

    const rating = await customerRatingService.getCustomerRatingForRequest(id, amount);

    return res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Get customer rating preview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute customer rating preview',
      error: error.message
    });
  }
};

module.exports = {
  getCustomerRating,
  getCustomerRatingForRequest
};

