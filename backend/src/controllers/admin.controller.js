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
    const { branch_code, branch_name, address_line1, address_line2, city, phone, status } = req.body;

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

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'city is required'
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'phone is required'
      });
    }

    // Prepare branch data
    const branchData = {
      branch_code,
      branch_name,
      address_line1,
      city,
      phone,
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
    const { branch_name, address_line1, city, phone, status } = req.body;

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
    if (city !== undefined) updateData.city = city;
    if (phone !== undefined) updateData.phone = phone;
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

// @desc    Get branch opening hours
// @route   GET /api/v1/admin/branches/:branchId/opening-hours
// @access  Private/Admin
const getBranchOpeningHours = async (req, res) => {
  try {
    console.log('⏰ Fetching branch opening hours');
    const { branchId } = req.params;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'branchId is required'
      });
    }

    const result = await adminService.getBranchOpeningHours(branchId);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Opening hours retrieved successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get opening hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving opening hours',
      error: error.message
    });
  }
};

// @desc    Update branch opening hours
// @route   PUT /api/v1/admin/branches/:branchId/opening-hours
// @access  Private/Admin
const updateBranchOpeningHours = async (req, res) => {
  try {
    console.log('✏️ Updating branch opening hours');
    const { branchId } = req.params;
    const { hours } = req.body;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'branchId is required'
      });
    }

    if (!Array.isArray(hours)) {
      return res.status(400).json({
        success: false,
        message: 'hours must be an array'
      });
    }

    // Validate exactly 7 entries
    if (hours.length !== 7) {
      return res.status(400).json({
        success: false,
        message: 'hours array must contain exactly 7 entries (MON-SUN)'
      });
    }

    // Valid days of week
    const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    // Validate each entry
    for (let i = 0; i < hours.length; i++) {
      const entry = hours[i];

      // Check day_of_week exists and is valid
      if (!entry.day_of_week || !validDays.includes(entry.day_of_week)) {
        return res.status(400).json({
          success: false,
          message: `Invalid day_of_week at index ${i}. Must be one of: ${validDays.join(', ')}`
        });
      }

      // Check is_closed is boolean
      if (typeof entry.is_closed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: `is_closed at index ${i} must be a boolean`
        });
      }

      // Validate times
      if (entry.is_closed) {
        // If closed, times should be null
        entry.open_time = null;
        entry.close_time = null;
      } else {
        // If not closed, times are required
        if (!entry.open_time || !entry.close_time) {
          return res.status(400).json({
            success: false,
            message: `open_time and close_time are required at index ${i} when is_closed is false`
          });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(entry.open_time) || !timeRegex.test(entry.close_time)) {
          return res.status(400).json({
            success: false,
            message: `Invalid time format at index ${i}. Use HH:MM format (24-hour)`
          });
        }

        // Validate open_time < close_time
        if (entry.open_time >= entry.close_time) {
          return res.status(400).json({
            success: false,
            message: `open_time must be before close_time at index ${i}`
          });
        }
      }
    }

    const result = await adminService.updateBranchOpeningHours(branchId, hours);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Opening hours updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Update opening hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating opening hours',
      error: error.message
    });
  }
};

// @desc    Get all occupations
// @route   GET /api/v1/admin/occupations
// @access  Private/Admin
const getOccupations = async (req, res) => {
  try {
    console.log('📋 Fetching all occupations');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await adminService.getOccupations(page, limit);

    res.json({
      success: true,
      message: 'Occupations retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Get occupations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving occupations',
      error: error.message
    });
  }
};

// @desc    Create a new occupation
// @route   POST /api/v1/admin/occupations
// @access  Private/Admin
const createOccupation = async (req, res) => {
  try {
    console.log('➕ Creating new occupation');
    let { occupation_name } = req.body;

    // Validation
    if (!occupation_name) {
      return res.status(400).json({
        success: false,
        message: 'occupation_name is required'
      });
    }

    // Trim whitespace
    occupation_name = occupation_name.trim();

    // Validate not empty after trim
    if (occupation_name.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'occupation_name cannot be empty'
      });
    }

    const result = await adminService.createOccupation(occupation_name);

    if (!result.success) {
      if (result.code === 'DUPLICATE') {
        return res.status(409).json(result);
      }
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Occupation created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Create occupation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating occupation',
      error: error.message
    });
  }
};

// @desc    Update an occupation
// @route   PUT /api/v1/admin/occupations/:occupationId
// @access  Private/Admin
const updateOccupation = async (req, res) => {
  try {
    console.log('✏️ Updating occupation');
    const { occupationId } = req.params;
    let { occupation_name } = req.body;

    if (!occupationId) {
      return res.status(400).json({
        success: false,
        message: 'occupationId is required'
      });
    }

    if (!occupation_name) {
      return res.status(400).json({
        success: false,
        message: 'occupation_name is required'
      });
    }

    // Trim whitespace
    occupation_name = occupation_name.trim();

    // Validate not empty after trim
    if (occupation_name.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'occupation_name cannot be empty'
      });
    }

    const result = await adminService.updateOccupation(occupationId, occupation_name);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      if (result.code === 'DUPLICATE') {
        return res.status(409).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Occupation updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Update occupation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating occupation',
      error: error.message
    });
  }
};

// @desc    Delete an occupation
// @route   DELETE /api/v1/admin/occupations/:occupationId
// @access  Private/Admin
const deleteOccupation = async (req, res) => {
  try {
    console.log('🗑️ Deleting occupation');
    const { occupationId } = req.params;

    if (!occupationId) {
      return res.status(400).json({
        success: false,
        message: 'occupationId is required'
      });
    }

    const result = await adminService.deleteOccupation(occupationId);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Occupation deleted successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Delete occupation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting occupation',
      error: error.message
    });
  }
};

// @desc    Get all pawning periods
// @route   GET /api/v1/admin/pawning-periods
// @access  Private/Admin
const getPawningPeriods = async (req, res) => {
  try {
    console.log('📋 Fetching all pawning periods');

    const result = await adminService.getPawningPeriods();

    res.json({
      success: true,
      message: 'Pawning periods retrieved successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get pawning periods error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving pawning periods',
      error: error.message
    });
  }
};

// @desc    Create a new pawning period
// @route   POST /api/v1/admin/pawning-periods
// @access  Private/Admin
const createPawningPeriod = async (req, res) => {
  try {
    console.log('➕ Creating new pawning period');
    const { period_name, duration_months, is_active } = req.body;

    // Validation
    if (!period_name) {
      return res.status(400).json({
        success: false,
        message: 'period_name is required'
      });
    }

    if (duration_months === undefined || duration_months === null) {
      return res.status(400).json({
        success: false,
        message: 'duration_months is required'
      });
    }

    // Validate duration_months is one of 3, 6, 12
    const validDurations = [3, 6, 12];
    if (!validDurations.includes(Number(duration_months))) {
      return res.status(400).json({
        success: false,
        message: 'duration_months must be one of: 3, 6, 12'
      });
    }

    const periodData = {
      period_name,
      duration_months: Number(duration_months),
      is_active: is_active !== undefined ? is_active : true
    };

    const result = await adminService.createPawningPeriod(periodData);

    if (!result.success) {
      if (result.code === 'DUPLICATE') {
        return res.status(409).json(result);
      }
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Pawning period created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Create pawning period error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating pawning period',
      error: error.message
    });
  }
};

// @desc    Update a pawning period
// @route   PUT /api/v1/admin/pawning-periods/:periodId
// @access  Private/Admin
const updatePawningPeriod = async (req, res) => {
  try {
    console.log('✏️ Updating pawning period');
    const { periodId } = req.params;
    const { period_name, duration_months, is_active } = req.body;

    if (!periodId) {
      return res.status(400).json({
        success: false,
        message: 'periodId is required'
      });
    }

    // Prepare update data - only include fields that are provided
    const updateData = {};

    if (period_name !== undefined) {
      updateData.period_name = period_name;
    }

    if (duration_months !== undefined && duration_months !== null) {
      // Validate duration_months is one of 3, 6, 12
      const validDurations = [3, 6, 12];
      if (!validDurations.includes(Number(duration_months))) {
        return res.status(400).json({
          success: false,
          message: 'duration_months must be one of: 3, 6, 12'
        });
      }
      updateData.duration_months = Number(duration_months);
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // Check if at least one field is provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update'
      });
    }

    const result = await adminService.updatePawningPeriod(periodId, updateData);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      if (result.code === 'DUPLICATE') {
        return res.status(409).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Pawning period updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Update pawning period error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pawning period',
      error: error.message
    });
  }
};

// @desc    Get all time slots
// @route   GET /api/v1/admin/time-slots
// @access  Private/Admin
const getTimeSlots = async (req, res) => {
  try {
    console.log('📋 Fetching all time slots');

    const result = await adminService.getTimeSlots();

    res.json({
      success: true,
      message: 'Time slots retrieved successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving time slots',
      error: error.message
    });
  }
};

// @desc    Update a time slot
// @route   PUT /api/v1/admin/time-slots/:slotId
// @access  Private/Admin
const updateTimeSlot = async (req, res) => {
  try {
    console.log('✏️ Updating time slot');
    const { slotId } = req.params;
    const { capacity, is_active } = req.body;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'slotId is required'
      });
    }

    // Prepare update data
    const updateData = {};

    if (capacity !== undefined && capacity !== null) {
      // Validate capacity
      const capacityNum = Number(capacity);
      if (!Number.isInteger(capacityNum) || capacityNum < 1 || capacityNum > 20) {
        return res.status(400).json({
          success: false,
          message: 'capacity must be an integer between 1 and 20'
        });
      }
      updateData.capacity = capacityNum;
    }

    if (is_active !== undefined && is_active !== null) {
      // Validate is_active (must be 0 or 1)
      const isActiveNum = Number(is_active);
      if (![0, 1].includes(isActiveNum)) {
        return res.status(400).json({
          success: false,
          message: 'is_active must be 0 or 1'
        });
      }
      updateData.is_active = isActiveNum;
    }

    // Check if at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (capacity or is_active) must be provided for update'
      });
    }

    const result = await adminService.updateTimeSlot(slotId, updateData);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Time slot updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Update time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating time slot',
      error: error.message
    });
  }
};

// @desc    Generate default time slots
// @route   POST /api/v1/admin/time-slots/generate
// @access  Private/Admin
const generateDefaultTimeSlots = async (req, res) => {
  try {
    console.log('🔘 Generating default time slots');

    // Generate time slots from 09:00 to 14:00, 30 min intervals
    const slots = [];
    const startHour = 9;
    const endHour = 14;
    const capacity = 5;
    const interval = 30; // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const slotStart = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const endMinute = minute + interval;
        let endHourSlot = hour;
        let endMinuteSlot = endMinute;

        if (endMinuteSlot >= 60) {
          endHourSlot += 1;
          endMinuteSlot -= 60;
        }

        const slotEnd = `${String(endHourSlot).padStart(2, '0')}:${String(endMinuteSlot).padStart(2, '0')}`;

        slots.push({
          slot_start: slotStart,
          slot_end: slotEnd,
          capacity
        });
      }
    }

    const result = await adminService.generateDefaultTimeSlots(slots);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Default time slots generated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Generate time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating time slots',
      error: error.message
    });
  }
};

// @desc    Get all karat advance rates
// @route   GET /api/v1/admin/karat-advance-rates
// @access  Private/Admin
const getKaratAdvanceRates = async (req, res) => {
  try {
    console.log('📋 Fetching karat advance rates');

    const result = await adminService.getKaratAdvanceRates();

    res.json({
      success: true,
      message: 'Karat advance rates retrieved successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Get karat advance rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving karat advance rates',
      error: error.message
    });
  }
};

// @desc    Update karat advance rate
// @route   PUT /api/v1/admin/karat-advance-rates/:karat
// @access  Private/Admin
const updateKaratAdvanceRate = async (req, res) => {
  try {
    console.log('✏️ Updating karat advance rate');
    const { karat } = req.params;
    const { advance_value_per_gram } = req.body;

    // Validate karat parameter
    const validKarats = [18, 20, 22];
    const karatNum = Number(karat);

    if (!validKarats.includes(karatNum)) {
      return res.status(400).json({
        success: false,
        message: 'karat must be one of: 18, 20, 22'
      });
    }

    // Validate advance_value_per_gram
    if (advance_value_per_gram === undefined || advance_value_per_gram === null) {
      return res.status(400).json({
        success: false,
        message: 'advance_value_per_gram is required'
      });
    }

    const advanceValue = Number(advance_value_per_gram);

    if (isNaN(advanceValue) || advanceValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'advance_value_per_gram must be a number greater than 0'
      });
    }

    const rateData = {
      karat: karatNum,
      advance_value_per_gram: advanceValue,
      updated_by_staff_id: req.user?.user_id || null
    };

    const result = await adminService.updateKaratAdvanceRate(rateData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Karat advance rate updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Update karat advance rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating karat advance rate',
      error: error.message
    });
  }
};

// @desc    Get all system settings
// @route   GET /api/v1/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
  try {
    console.log('📋 Fetching system settings');

    const result = await adminService.getSystemSettings();

    // Create a key-value map from the array
    const settingsMap = {};
    result.data.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    res.json({
      success: true,
      message: 'System settings retrieved successfully',
      data: result.data,
      map: settingsMap
    });
  } catch (error) {
    console.error('❌ Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system settings',
      error: error.message
    });
  }
};

// @desc    Update a system setting
// @route   PUT /api/v1/admin/settings/:key
// @access  Private/Admin
const updateSystemSetting = async (req, res) => {
  try {
    console.log('✏️ Updating system setting');
    const { key } = req.params;
    const { value } = req.body;

    // Validate key
    if (!key || key.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'key is required'
      });
    }

    // Validate value is not null
    if (value === null || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'value cannot be null'
      });
    }

    // Key-specific validations
    let validationError = null;

    switch (key.toUpperCase()) {
      case 'ANNUAL_INTEREST_RATE':
        const rate = Number(value);
        if (isNaN(rate) || rate <= 0 || rate > 100) {
          validationError = 'ANNUAL_INTEREST_RATE must be a number between 0 (exclusive) and 100 (inclusive)';
        }
        break;

      case 'MIN_LOAN_AMOUNT':
        const minLoan = Number(value);
        if (!Number.isInteger(minLoan) || minLoan < 5000) {
          validationError = 'MIN_LOAN_AMOUNT must be an integer >= 5000';
        }
        break;

      case 'MAX_ARTICLES_PER_TICKET':
        const maxArticles = Number(value);
        if (!Number.isInteger(maxArticles) || maxArticles < 1 || maxArticles > 5) {
          validationError = 'MAX_ARTICLES_PER_TICKET must be an integer between 1 and 5';
        }
        break;

      case 'APPOINTMENT_SLOT_CAPACITY':
        const slotCapacity = Number(value);
        if (!Number.isInteger(slotCapacity) || slotCapacity < 1 || slotCapacity > 5) {
          validationError = 'APPOINTMENT_SLOT_CAPACITY must be an integer between 1 and 5';
        }
        break;

      case 'APPOINTMENT_SLOT_MINUTES':
        if (value !== '30' && value !== 30) {
          validationError = 'APPOINTMENT_SLOT_MINUTES must be 30';
        }
        break;

      case 'APPOINTMENT_SLOT_START':
        if (value !== '09:00') {
          validationError = 'APPOINTMENT_SLOT_START must be "09:00"';
        }
        break;

      case 'APPOINTMENT_SLOT_END':
        if (value !== '14:00') {
          validationError = 'APPOINTMENT_SLOT_END must be "14:00"';
        }
        break;
    }

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const result = await adminService.updateSystemSetting(key, String(value), req.user?.user_id || null);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'System setting updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('❌ Update system setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system setting',
      error: error.message
    });
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  getBranchOpeningHours,
  updateBranchOpeningHours,
  getOccupations,
  createOccupation,
  updateOccupation,
  deleteOccupation,
  getPawningPeriods,
  createPawningPeriod,
  updatePawningPeriod,
  getTimeSlots,
  updateTimeSlot,
  generateDefaultTimeSlots,
  getKaratAdvanceRates,
  updateKaratAdvanceRate,
  getSystemSettings,
  updateSystemSetting
};
