const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// @desc    Login user (first login with NIC)
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { nic, password } = req.body;

    // Validate input
    if (!nic || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide NIC and password'
      });
    }

    // Get user with roles
    const [users] = await pool.query(
      `SELECT u.user_id, u.nic, u.password_hash, u.full_name, u.status,
              GROUP_CONCAT(DISTINCT r.role_name) as roles,
              sp.staff_id, sp.staff_type, sp.branch_id
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       LEFT JOIN staff_profiles sp ON u.user_id = sp.staff_id
       WHERE u.nic = ? AND u.status = 'ACTIVE'
       GROUP BY u.user_id`,
      [nic]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id,
        nic: user.nic,
        roles: user.roles ? user.roles.split(',') : []
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          user_id: user.user_id,
          nic: user.nic,
          full_name: user.full_name,
          roles: user.roles ? user.roles.split(',') : [],
          staff_type: user.staff_type,
          branch_id: user.branch_id
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.user_id, u.nic, u.full_name, u.status,
              GROUP_CONCAT(DISTINCT r.role_name) as roles,
              sp.staff_type, sp.branch_id, b.branch_name
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       LEFT JOIN staff_profiles sp ON u.user_id = sp.staff_id
       LEFT JOIN branches b ON sp.branch_id = b.branch_id
       WHERE u.user_id = ?
       GROUP BY u.user_id`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        user_id: user.user_id,
        nic: user.nic,
        full_name: user.full_name,
        roles: user.roles ? user.roles.split(',') : [],
        staff_type: user.staff_type,
        branch_id: user.branch_id,
        branch_name: user.branch_name
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get current password hash
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newPasswordHash, req.user.user_id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  login,
  getMe,
  changePassword
};
