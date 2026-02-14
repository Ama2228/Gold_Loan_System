const adminService = require('../services/admin.service');

// @desc    Get all branches
// @route   GET /api/v1/admin/branches
// @access  Private/Admin
const getBranches = async (req, res) => {
  try {
    console.log('📋 Fetching all branches');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await adminService.getBranches(page, limit);

    res.json({
      success: true,
      message: 'Branches retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Get branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving branches',
      error: error.message
    });
  }
};

// @desc    Create a new branch
// @route   POST /api/v1/admin/branches
// @access  Private/Admin
const createBranch = async (req, res) => {
  try {
    console.log('➕ Creating new branch');
    const { branch_code, branch_name, address_line1, address_line2, city_id, status } = req.body;

    // Validation
    if (!branch_code) {
      return res.status(400).json({
        success: false,
        message: 'branch_code is required'
      });
    }

    // Validate branch_code format: exactly 4 characters, numeric
    if (!/^\d{4}$/.test(branch_code)) {
      return res.status(400).json({
        success: false,
        message: 'branch_code must be exactly 4 numeric characters (e.g., "0001" or "0756")'
      });
    }

    if (!branch_name) {
      return res.status(400).json({
        success: false,
        message: 'branch_name is required'
      });
    }

    if (!address_line1) {
      return res.status(400).json({
        success: false,
        message: 'address_line1 is required'
      });
    }

    // Prepare branch data
    const branchData = {
      branch_code,
      branch_name,
      address_line1,
      address_line2: address_line2 || null,
      city_id: city_id || null,
      status: status || 'ACTIVE'
    };

    const result = await adminService.createBranch(branchData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Create branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating branch',
      error: error.message
    });
  }
};

// @desc    Update a branch
// @route   PUT /api/v1/admin/branches/:branchId
// @access  Private/Admin
const updateBranch = async (req, res) => {
  try {
    console.log('✏️ Updating branch');
    const { branchId } = req.params;
    const { branch_name, address_line1, address_line2, city_id, status } = req.body;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'branchId is required'
      });
    }

    // Prepare update data - only include fields that are provided
    const updateData = {};
    
    if (branch_name !== undefined) updateData.branch_name = branch_name;
    if (address_line1 !== undefined) updateData.address_line1 = address_line1;
    if (address_line2 !== undefined) updateData.address_line2 = address_line2;
    if (city_id !== undefined) updateData.city_id = city_id;
    if (status !== undefined) updateData.status = status;

    // Check if at least one field is provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update'
      });
    }

    const result = await adminService.updateBranch(branchId, updateData);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Update branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating branch',
      error: error.message
    });
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch
};
