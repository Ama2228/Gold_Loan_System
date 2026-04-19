const adminService = require('../services/admin.service');

// @desc    Get current annual interest rate (public)
// @route   GET /api/v1/public/annual-interest-rate
// @access  Public
const getAnnualInterestRate = async (req, res) => {
  try {
    const result = await adminService.getSystemSettingByKey('ANNUAL_INTEREST_RATE');

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    const raw = result.data.setting_value;
    const numericRate = Number(raw);

    res.json({
      success: true,
      data: {
        settingKey: result.data.setting_key,
        rate: Number.isFinite(numericRate) ? numericRate : raw,
        unit: 'p.a.'
      }
    });
  } catch (error) {
    console.error('❌ Get annual interest rate (public) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving annual interest rate',
      error: error.message
    });
  }
};

// @desc    Get public karat advance rates
// @route   GET /api/v1/public/karat-advance-rates
// @access  Public
const getPublicKaratAdvanceRates = async (req, res) => {
  try {
    const result = await adminService.getKaratAdvanceRates();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to retrieve karat advance rates'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get public karat advance rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving karat advance rates',
      error: error.message
    });
  }
};

module.exports = {
  getAnnualInterestRate,
  getPublicKaratAdvanceRates
};