const staffCustomersService = require('../services/staffCustomers.service');

// @desc    Create a new customer
// @route   POST /api/v1/staff/customers
// @access  Private/Staff/Manager
const createCustomer = async (req, res) => {
  try {
    console.log('➕ Creating new customer');
    const customerData = req.body;
    const createdByUserId = req.user.user_id;

    // Validate required fields
    const {
      full_name,
      nic,
      password,
      phone,
      branch_id,
      occupation_id,
      city_id,
      address_line1,
      email,
      address_line2
    } = customerData;

    // Check required fields
    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: 'full_name is required'
      });
    }

    if (!nic) {
      return res.status(400).json({
        success: false,
        message: 'nic is required'
      });
    }

    // NIC must be 12 digits (only numbers)
    if (!/^\d{12}$/.test(nic)) {
      return res.status(400).json({
        success: false,
        message: 'NIC must be exactly 12 digits (only numbers)'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'password is required'
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'phone is required'
      });
    }

    if (!branch_id) {
      return res.status(400).json({
        success: false,
        message: 'branch_id is required'
      });
    }

    if (!occupation_id) {
      return res.status(400).json({
        success: false,
        message: 'occupation_id is required'
      });
    }

    if (!city_id) {
      return res.status(400).json({
        success: false,
        message: 'city_id is required'
      });
    }

    if (!address_line1) {
      return res.status(400).json({
        success: false,
        message: 'address_line1 is required'
      });
    }

    // Prepare data object
    const data = {
      full_name,
      nic,
      password,
      phone,
      branch_id,
      occupation_id,
      city_id,
      address_line1,
      email: email || null,
      address_line2: address_line2 || null
    };

    // Pass user info for activity logging
    const userInfo = {
      user_id: createdByUserId,
      roles: req.user.roles // Array of role names from auth middleware
    };

    const result = await staffCustomersService.createCustomer(data, userInfo);

    res.status(201).json({
      success: true,
      message: 'Customer created',
      data: result
    });
  } catch (error) {
    console.error('❌ Create customer error:', error);
    
    // Handle duplicate NIC error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Customer with this NIC already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// @desc    List all customers with pagination and search
// @route   GET /api/v1/staff/customers
// @access  Private/Staff/Manager
const listCustomers = async (req, res) => {
  try {
    console.log('📋 Fetching customers list');
    
    // Read query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    const result = await staffCustomersService.getCustomers({ page, limit, search, offset });

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('❌ List customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customers',
      error: error.message
    });
  }
};

// @desc    Get customer by ID
// @route   GET /api/v1/staff/customers/:customerId
// @access  Private/Staff/Manager
const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log(`🔍 Fetching customer ID: ${customerId}`);

    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await staffCustomersService.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer retrieved successfully',
      data: customer
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

// @desc    Search customers by query
// @route   GET /api/v1/staff/customers/search?q=query OR GET /api/v1/staff/customers/search/:query
// @access  Private/Staff/Manager
const searchCustomers = async (req, res) => {
  try {
    // Support both query param and path param
    const query = req.query.q || req.params.query;
    console.log(`🔍 Searching customers with query: ${query}`);

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    if (query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const customers = await staffCustomersService.searchCustomers(query.trim());

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: customers
    });
  } catch (error) {
    console.error('❌ Search customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching customers',
      error: error.message
    });
  }
};

// @desc    Get all occupations
// @route   GET /api/v1/staff/customers/meta/occupations
// @access  Private/Staff/Manager
const getOccupations = async (req, res) => {
  try {
    console.log('📋 Fetching occupations');
    const occupations = await staffCustomersService.getOccupations();

    res.json({
      success: true,
      message: 'Occupations retrieved successfully',
      data: occupations
    });
  } catch (error) {
    console.error('❌ Get occupations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching occupations',
      error: error.message
    });
  }
};

// @desc    Get all cities
// @route   GET /api/v1/staff/customers/meta/cities
// @access  Private/Staff/Manager
const getCities = async (req, res) => {
  try {
    console.log('📋 Fetching cities');
    const cities = await staffCustomersService.getCities();

    res.json({
      success: true,
      message: 'Cities retrieved successfully',
      data: cities
    });
  } catch (error) {
    console.error('❌ Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
      error: error.message
    });
  }
};

// @desc    Get all districts
// @route   GET /api/v1/staff/customers/meta/districts
// @access  Private/Staff/Manager
const getDistricts = async (req, res) => {
  try {
    console.log('📋 Fetching districts');
    const districts = await staffCustomersService.getDistricts();

    res.json({
      success: true,
      message: 'Districts retrieved successfully',
      data: districts
    });
  } catch (error) {
    console.error('❌ Get districts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching districts',
      error: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/v1/staff/customers/:customerId
// @access  Private/Staff/Manager
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log(`✏️ Updating customer ID: ${customerId}`);

    // Validate customerId
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    // Accept only specific fields
    const { full_name, phone, email, occupation_id } = req.body;
    const updateData = {};

    // Build update object with only allowed fields
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (occupation_id !== undefined) updateData.occupation_id = occupation_id;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update. Allowed fields: full_name, phone, email, occupation_id'
      });
    }

    const result = await staffCustomersService.updateCustomer(customerId, updateData);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// @desc    Delete customer (soft delete)
// @route   DELETE /api/v1/staff/customers/:customerId
// @access  Private/Staff/Manager
const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log(`🗑️ Soft deleting customer ID: ${customerId}`);

    // Validate customerId
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const result = await staffCustomersService.deleteCustomer(customerId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getOccupations,
  getCities,
  getDistricts
};
