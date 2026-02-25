const adminStaffService = require('../services/adminStaff.service');

// @desc    Get all staff with pagination
// @route   GET /api/v1/admin/staff
// @access  Private/Admin
const getStaff = async (req, res, next) => {
  try {
    console.log('📋 Fetching all staff');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || null;

    const result = await adminStaffService.getStaff(page, limit, search);

    res.json({
      success: true,
      message: 'Staff retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Get staff error:', error);
    next(error);
  }
};

// @desc    Create new staff account
// @route   POST /api/v1/admin/staff
// @access  Private/Admin
const createStaff = async (req, res, next) => {
  try {
    console.log('➕ Creating new staff');
    console.log('📨 Request body:', {
      nic: req.body.nic,
      full_name: req.body.full_name,
      roles: req.body.roles,
      branch_id: req.body.branch_id,
      phone: req.body.phone
    });

    const { nic, full_name, password, roles, branch_id, phone, joined_date } = req.body;

    // Validation
    if (!nic) {
      return res.status(400).json({
        success: false,
        message: 'NIC is required'
      });
    }

    // Validate NIC format (11 digits + V or number)
    if (!/^\d{9}[vV0-9]$/.test(nic)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NIC format. Must be 9 digits followed by V or 12 digits'
      });
    }

    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: 'full_name is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'password is required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'password must be at least 6 characters'
      });
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'roles must be a non-empty array (STAFF, MANAGER, ADMIN)'
      });
    }

    if (!branch_id) {
      return res.status(400).json({
        success: false,
        message: 'branch_id is required'
      });
    }

    const result = await adminStaffService.createStaff({
      nic: nic.toUpperCase(),
      full_name,
      password,
      roles,
      branch_id,
      phone: phone || null,
      joined_date
    });

    if (!result.success) {
      if (result.code === 'DUPLICATE_NIC') {
        return res.status(409).json(result);
      }
      if (result.code === 'INVALID_BRANCH') {
        return res.status(400).json(result);
      }
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Create staff error:', error);
    next(error);
  }
};

// @desc    Update staff profile
// @route   PUT /api/v1/admin/staff/:staffId
// @access  Private/Admin
const updateStaff = async (req, res, next) => {
  try {
    console.log('✏️ Updating staff');
    const { staffId } = req.params;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'staffId is required'
      });
    }

    const { branch_id, phone, status } = req.body;

    // Prepare update data
    const updateData = {};

    if (branch_id !== undefined) updateData.branch_id = branch_id;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) {
      if (status !== 'ACTIVE' && status !== 'INACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'status must be ACTIVE or INACTIVE'
        });
      }
      updateData.status = status;
    }

    // Check if at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update (branch_id, phone, status)'
      });
    }

    const result = await adminStaffService.updateStaff(staffId, updateData);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      if (result.code === 'INVALID_BRANCH') {
        return res.status(400).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Staff updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Update staff error:', error);
    next(error);
  }
};

// @desc    Toggle staff status (ACTIVE <-> INACTIVE)
// @route   PATCH /api/v1/admin/staff/:staffId/status
// @access  Private/Admin
const toggleStaffStatus = async (req, res, next) => {
  try {
    console.log('🔄 Toggling staff status');
    const { staffId } = req.params;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'staffId is required'
      });
    }

    const result = await adminStaffService.toggleStaffStatus(staffId);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Staff status toggled successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Toggle staff status error:', error);
    next(error);
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  toggleStaffStatus
};
