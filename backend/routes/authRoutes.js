const express = require('express');
const { body } = require('express-validator');
const { login, getMe, changePassword, registerLookup, register, logOtp } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('nic').notEmpty().withMessage('NIC is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
);

// @route   POST /api/v1/auth/register/lookup
// @desc    Lookup customer by NIC for registration
// @access  Public
router.post(
  '/register/lookup',
  [body('nic').notEmpty().withMessage('NIC is required')],
  validate,
  registerLookup
);

// @route   POST /api/v1/auth/register
// @desc    Complete registration - set password for pre-registered customer
// @access  Public
router.post(
  '/register',
  [
    body('nic').notEmpty().withMessage('NIC is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  validate,
  register
);

// @route   POST /api/v1/auth/otp/log
// @desc    Log OTP to backend console (dev/testing)
// @access  Public
router.post('/otp/log', logOtp);

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, getMe);

// @route   PUT /api/v1/auth/change-password
// @desc    Change password
// @access  Private
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  validate,
  changePassword
);

module.exports = router;
