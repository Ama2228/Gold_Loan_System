const { pool } = require('../../config/database');

// @desc    Get all branches with pagination
// @param   page - Page number (1-indexed)
// @param   limit - Records per page
// @returns Paginated list of branches
const getBranches = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM branches`
    );
    const total = countResult[0].total;

    // Get paginated branches
    const [branches] = await pool.query(
      `SELECT branch_id, branch_code, branch_name, address_line1, city, phone, status 
       FROM branches 
       ORDER BY branch_code
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return {
      success: true,
      data: branches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('❌ getBranches error:', error);
    throw error;
  }
};

// @desc    Create a new branch
// @param   data - Object with branch details
// @returns Created branch object
const createBranch = async (data) => {
  try {
    const { branch_code, branch_name, address_line1, city, phone, status } = data;

    const [result] = await pool.query(
      `INSERT INTO branches (branch_code, branch_name, address_line1, city, phone, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [branch_code, branch_name, address_line1, city, phone, status]
    );

    // Fetch the inserted branch
    const [insertedBranch] = await pool.query(
      `SELECT branch_id, branch_code, branch_name, address_line1, city, phone, status
       FROM branches
       WHERE branch_id = ?`,
      [result.insertId]
    );

    return {
      success: true,
      data: insertedBranch[0]
    };
  } catch (error) {
    console.error('❌ createBranch error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return {
        success: false,
        message: 'Branch code already exists'
      };
    }
    throw error;
  }
};

// @desc    Update a branch
// @param   branchId - Branch ID to update
// @param   data - Object with fields to update
// @returns Updated branch object or null if not found
const updateBranch = async (branchId, data) => {
  try {
    // Check if branch exists
    const [existingBranch] = await pool.query(
      `SELECT branch_id FROM branches WHERE branch_id = ?`,
      [branchId]
    );

    if (existingBranch.length === 0) {
      return {
        success: false,
        message: 'Branch not found',
        code: 'NOT_FOUND'
      };
    }

    // Build dynamic UPDATE query
    const fields = [];
    const values = [];

    if (data.branch_name !== undefined) {
      fields.push('branch_name = ?');
      values.push(data.branch_name);
    }
    if (data.address_line1 !== undefined) {
      fields.push('address_line1 = ?');
      values.push(data.address_line1);
    }

    if (data.city !== undefined) {
      fields.push('city = ?');
      values.push(data.city);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    // If no fields to update, return current branch
    if (fields.length === 0) {
      const [branch] = await pool.query(
        `SELECT branch_id, branch_code, branch_name, address_line1, city, phone, status
         FROM branches
         WHERE branch_id = ?`,
        [branchId]
      );
      return {
        success: true,
        data: branch[0]
      };
    }

    // Execute UPDATE
    values.push(branchId);
    await pool.query(
      `UPDATE branches SET ${fields.join(', ')} WHERE branch_id = ?`,
      values
    );

    // Fetch and return updated branch
    const [updatedBranch] = await pool.query(
      `SELECT branch_id, branch_code, branch_name, address_line1, city, phone, status
       FROM branches
       WHERE branch_id = ?`,
      [branchId]
    );

    return {
      success: true,
      data: updatedBranch[0]
    };
  } catch (error) {
    console.error('❌ updateBranch error:', error);
    throw error;
  }
};

// @desc    Get branch opening hours
// @param   branchId - Branch ID
// @returns Array of opening hours ordered MON-SUN
const getBranchOpeningHours = async (branchId) => {
  try {
    // Check if branch exists
    const [branch] = await pool.query(
      `SELECT branch_id FROM branches WHERE branch_id = ?`,
      [branchId]
    );

    if (branch.length === 0) {
      return {
        success: false,
        message: 'Branch not found',
        code: 'NOT_FOUND'
      };
    }

    // Get opening hours ordered by day
    const [hours] = await pool.query(
      `SELECT day_of_week, open_time, close_time, is_closed
       FROM branch_opening_hours
       WHERE branch_id = ?
       ORDER BY FIELD(day_of_week, 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')`,
      [branchId]
    );

    return {
      success: true,
      data: hours
    };
  } catch (error) {
    console.error('❌ getBranchOpeningHours error:', error);
    throw error;
  }
};

// @desc    Update branch opening hours (with transaction)
// @param   branchId - Branch ID
// @param   items - Array of 7 opening hour objects
// @returns Updated opening hours
const updateBranchOpeningHours = async (branchId, items) => {
  let connection;
  try {
    // Get a connection for transaction
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // Verify branch exists
    const [branch] = await connection.query(
      `SELECT branch_id FROM branches WHERE branch_id = ?`,
      [branchId]
    );

    if (branch.length === 0) {
      await connection.rollback();
      connection.release();
      return {
        success: false,
        message: 'Branch not found',
        code: 'NOT_FOUND'
      };
    }

    // Delete existing opening hours for this branch
    await connection.query(
      `DELETE FROM branch_opening_hours WHERE branch_id = ?`,
      [branchId]
    );

    // Insert new opening hours
    for (const item of items) {
      await connection.query(
        `INSERT INTO branch_opening_hours (branch_id, day_of_week, open_time, close_time, is_closed)
         VALUES (?, ?, ?, ?, ?)`,
        [branchId, item.day_of_week, item.open_time, item.close_time, item.is_closed]
      );
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    // Fetch and return the updated opening hours
    const [updatedHours] = await pool.query(
      `SELECT day_of_week, open_time, close_time, is_closed
       FROM branch_opening_hours
       WHERE branch_id = ?
       ORDER BY FIELD(day_of_week, 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')`,
      [branchId]
    );

    return {
      success: true,
      data: updatedHours
    };
  } catch (error) {
    console.error('❌ updateBranchOpeningHours error:', error);
    
    // Rollback on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('❌ Rollback error:', rollbackError);
      }
      connection.release();
    }
    
    throw error;
  }
};

// @desc    Get all occupations
// @returns List of all occupations
const getOccupations = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM occupations`
    );
    const total = countResult[0].total;

    // Get paginated occupations
    const [occupations] = await pool.query(
      `SELECT occupation_id, occupation_name 
       FROM occupations 
       ORDER BY occupation_name
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return {
      success: true,
      data: occupations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('❌ getOccupations error:', error);
    throw error;
  }
};

// @desc    Create a new occupation
// @param   name - Occupation name
// @returns Created occupation object
const createOccupation = async (name) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO occupations (occupation_name) VALUES (?)`,
      [name]
    );

    // Fetch the inserted occupation
    const [insertedOccupation] = await pool.query(
      `SELECT occupation_id, occupation_name FROM occupations WHERE occupation_id = ?`,
      [result.insertId]
    );

    return {
      success: true,
      data: insertedOccupation[0]
    };
  } catch (error) {
    console.error('❌ createOccupation error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return {
        success: false,
        message: 'Occupation name already exists',
        code: 'DUPLICATE'
      };
    }
    throw error;
  }
};

// @desc    Update an occupation
// @param   id - Occupation ID
// @param   name - New occupation name
// @returns Updated occupation object or null if not found
const updateOccupation = async (id, name) => {
  try {
    // Check if occupation exists
    const [existingOccupation] = await pool.query(
      `SELECT occupation_id FROM occupations WHERE occupation_id = ?`,
      [id]
    );

    if (existingOccupation.length === 0) {
      return {
        success: false,
        message: 'Occupation not found',
        code: 'NOT_FOUND'
      };
    }

    // Update occupation
    await pool.query(
      `UPDATE occupations SET occupation_name = ? WHERE occupation_id = ?`,
      [name, id]
    );

    // Fetch and return updated occupation
    const [updatedOccupation] = await pool.query(
      `SELECT occupation_id, occupation_name FROM occupations WHERE occupation_id = ?`,
      [id]
    );

    return {
      success: true,
      data: updatedOccupation[0]
    };
  } catch (error) {
    console.error('❌ updateOccupation error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return {
        success: false,
        message: 'Occupation name already exists',
        code: 'DUPLICATE'
      };
    }
    throw error;
  }
};

// @desc    Delete an occupation
// @param   id - Occupation ID
// @returns Success status
const deleteOccupation = async (id) => {
  try {
    // Check if occupation exists
    const [existingOccupation] = await pool.query(
      `SELECT occupation_id FROM occupations WHERE occupation_id = ?`,
      [id]
    );

    if (existingOccupation.length === 0) {
      return {
        success: false,
        message: 'Occupation not found',
        code: 'NOT_FOUND'
      };
    }

    // Delete occupation
    const [result] = await pool.query(
      `DELETE FROM occupations WHERE occupation_id = ?`,
      [id]
    );

    return {
      success: true,
      data: {
        deleted: result.affectedRows > 0
      }
    };
  } catch (error) {
    console.error('❌ deleteOccupation error:', error);
    throw error;
  }
};

// @desc    Get all pawning periods
// @returns List of all pawning periods
const getPawningPeriods = async () => {
  try {
    const [periods] = await pool.query(
      `SELECT period_id, period_name, duration_months, is_active 
       FROM pawning_periods 
       ORDER BY duration_months`
    );

    return {
      success: true,
      data: periods
    };
  } catch (error) {
    console.error('❌ getPawningPeriods error:', error);
    throw error;
  }
};

// @desc    Create a new pawning period
// @param   data - Object with period details
// @returns Created period object
const createPawningPeriod = async (data) => {
  try {
    const { period_name, duration_months, is_active } = data;

    const [result] = await pool.query(
      `INSERT INTO pawning_periods (period_name, duration_months, is_active)
       VALUES (?, ?, ?)`,
      [period_name, duration_months, is_active]
    );

    // Fetch the inserted period
    const [insertedPeriod] = await pool.query(
      `SELECT period_id, period_name, duration_months, is_active
       FROM pawning_periods
       WHERE period_id = ?`,
      [result.insertId]
    );

    return {
      success: true,
      data: insertedPeriod[0]
    };
  } catch (error) {
    console.error('❌ createPawningPeriod error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return {
        success: false,
        message: 'Pawning period already exists',
        code: 'DUPLICATE'
      };
    }
    throw error;
  }
};

// @desc    Update a pawning period
// @param   periodId - Period ID to update
// @param   data - Object with fields to update
// @returns Updated period object or null if not found
const updatePawningPeriod = async (periodId, data) => {
  try {
    // Check if period exists
    const [existingPeriod] = await pool.query(
      `SELECT period_id FROM pawning_periods WHERE period_id = ?`,
      [periodId]
    );

    if (existingPeriod.length === 0) {
      return {
        success: false,
        message: 'Pawning period not found',
        code: 'NOT_FOUND'
      };
    }

    // Build dynamic UPDATE query
    const fields = [];
    const values = [];

    if (data.period_name !== undefined) {
      fields.push('period_name = ?');
      values.push(data.period_name);
    }
    if (data.duration_months !== undefined) {
      fields.push('duration_months = ?');
      values.push(data.duration_months);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }

    // If no fields to update, return current period
    if (fields.length === 0) {
      const [period] = await pool.query(
        `SELECT period_id, period_name, duration_months, is_active
         FROM pawning_periods
         WHERE period_id = ?`,
        [periodId]
      );
      return {
        success: true,
        data: period[0]
      };
    }

    // Execute UPDATE
    values.push(periodId);
    await pool.query(
      `UPDATE pawning_periods SET ${fields.join(', ')} WHERE period_id = ?`,
      values
    );

    // Fetch and return updated period
    const [updatedPeriod] = await pool.query(
      `SELECT period_id, period_name, duration_months, is_active
       FROM pawning_periods
       WHERE period_id = ?`,
      [periodId]
    );

    return {
      success: true,
      data: updatedPeriod[0]
    };
  } catch (error) {
    console.error('❌ updatePawningPeriod error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return {
        success: false,
        message: 'Pawning period already exists',
        code: 'DUPLICATE'
      };
    }
    throw error;
  }
};

// @desc    Get all time slots
// @returns List of all time slots
const getTimeSlots = async () => {
  try {
    const [slots] = await pool.query(
      `SELECT slot_id, slot_start, slot_end, capacity, is_active
       FROM time_slots
       ORDER BY slot_start`
    );

    return {
      success: true,
      data: slots
    };
  } catch (error) {
    console.error('❌ getTimeSlots error:', error);
    throw error;
  }
};

// @desc    Update a time slot
// @param   slotId - Slot ID to update
// @param   data - Object with fields to update
// @returns Updated slot object or null if not found
const updateTimeSlot = async (slotId, data) => {
  try {
    // Check if slot exists
    const [existingSlot] = await pool.query(
      `SELECT slot_id FROM time_slots WHERE slot_id = ?`,
      [slotId]
    );

    if (existingSlot.length === 0) {
      return {
        success: false,
        message: 'Time slot not found',
        code: 'NOT_FOUND'
      };
    }

    // Build dynamic UPDATE query using COALESCE
    const fields = [];
    const values = [];

    if (data.capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(data.capacity);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }

    // If no fields to update, return current slot
    if (fields.length === 0) {
      const [slot] = await pool.query(
        `SELECT slot_id, slot_start, slot_end, capacity, is_active
         FROM time_slots
         WHERE slot_id = ?`,
        [slotId]
      );
      return {
        success: true,
        data: slot[0]
      };
    }

    // Execute UPDATE
    values.push(slotId);
    await pool.query(
      `UPDATE time_slots SET ${fields.join(', ')} WHERE slot_id = ?`,
      values
    );

    // Fetch and return updated slot
    const [updatedSlot] = await pool.query(
      `SELECT slot_id, slot_start, slot_end, capacity, is_active
       FROM time_slots
       WHERE slot_id = ?`,
      [slotId]
    );

    return {
      success: true,
      data: updatedSlot[0]
    };
  } catch (error) {
    console.error('❌ updateTimeSlot error:', error);
    throw error;
  }
};

// @desc    Generate default time slots (09:00-14:00, 30 min intervals)
// @param   slots - Array of slot objects
// @returns List of created/existing slots
const generateDefaultTimeSlots = async (slots) => {
  let connection;
  try {
    // Get a connection for transaction
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // Insert slots using INSERT IGNORE to avoid duplicates
    for (const slot of slots) {
      await connection.query(
        `INSERT IGNORE INTO time_slots (slot_start, slot_end, capacity, is_active)
         VALUES (?, ?, ?, 1)`,
        [slot.slot_start, slot.slot_end, slot.capacity]
      );
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    // Fetch and return all time slots
    const [allSlots] = await pool.query(
      `SELECT slot_id, slot_start, slot_end, capacity, is_active
       FROM time_slots
       ORDER BY slot_start`
    );

    return {
      success: true,
      data: allSlots
    };
  } catch (error) {
    console.error('❌ generateDefaultTimeSlots error:', error);

    // Rollback on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('❌ Rollback error:', rollbackError);
      }
      connection.release();
    }

    throw error;
  }
};

// @desc    Get all active karat advance rates
// @returns List of active rates for karats 18, 20, 22
const getKaratAdvanceRates = async () => {
  try {
    const [rates] = await pool.query(
      `SELECT karat, advance_value_per_gram, effective_from
       FROM karat_advance_rates
       WHERE is_active = 1
       ORDER BY karat`
    );

    return {
      success: true,
      data: rates
    };
  } catch (error) {
    console.error('❌ getKaratAdvanceRates error:', error);
    throw error;
  }
};

// @desc    Update karat advance rate (deactivate old, insert new)
// @param   data - Object with karat, advance_value_per_gram, updated_by_staff_id
// @returns Updated rate object
const updateKaratAdvanceRate = async (data) => {
  let connection;
  try {
    const { karat, advance_value_per_gram, updated_by_staff_id } = data;

    // Get a connection for transaction
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // Step 1: Prefer in-place update of an active row to avoid uq_karat_active collisions.
    const [updateActive] = await connection.query(
      `UPDATE karat_advance_rates
       SET advance_value_per_gram = ?, effective_from = CURDATE(), updated_by_staff_id = ?, is_active = 1
       WHERE karat = ? AND is_active = 1`,
      [advance_value_per_gram, updated_by_staff_id, karat]
    );

    // Step 2: If no active row exists, reactivate the latest row for the karat.
    if (updateActive.affectedRows === 0) {
      const [updateAny] = await connection.query(
        `UPDATE karat_advance_rates
         SET advance_value_per_gram = ?, effective_from = CURDATE(), updated_by_staff_id = ?, is_active = 1
         WHERE karat = ?
         ORDER BY rate_id DESC
         LIMIT 1`,
        [advance_value_per_gram, updated_by_staff_id, karat]
      );

      // Step 3: If karat has no row yet, insert a fresh active row.
      if (updateAny.affectedRows === 0) {
        await connection.query(
          `INSERT INTO karat_advance_rates (karat, advance_value_per_gram, effective_from, is_active, updated_by_staff_id)
           VALUES (?, ?, CURDATE(), 1, ?)`,
          [karat, advance_value_per_gram, updated_by_staff_id]
        );
      }
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    // Step 4: Fetch and return the new active rate
    const [newRate] = await pool.query(
      `SELECT karat, advance_value_per_gram, effective_from
       FROM karat_advance_rates
       WHERE karat = ? AND is_active = 1`,
      [karat]
    );

    return {
      success: true,
      data: newRate[0]
    };
  } catch (error) {
    console.error('❌ updateKaratAdvanceRate error:', error);

    // Rollback on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('❌ Rollback error:', rollbackError);
      }
      connection.release();
    }

    throw error;
  }
};

// @desc    Get all system settings
// @returns List of all system settings
const getSystemSettings = async () => {
  try {
    const [settings] = await pool.query(
      `SELECT setting_key, setting_value, description, updated_at
       FROM system_settings
       ORDER BY setting_key`
    );

    return {
      success: true,
      data: settings
    };
  } catch (error) {
    console.error('❌ getSystemSettings error:', error);
    throw error;
  }
};

// @desc    Get one system setting by key
// @param   key - Setting key
// @returns Setting row or NOT_FOUND status
const getSystemSettingByKey = async (key) => {
  try {
    const [rows] = await pool.query(
      `SELECT setting_key, setting_value, description, updated_at
       FROM system_settings
       WHERE setting_key = ?
       LIMIT 1`,
      [key]
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: 'System setting not found',
        code: 'NOT_FOUND'
      };
    }

    return {
      success: true,
      data: rows[0]
    };
  } catch (error) {
    console.error('❌ getSystemSettingByKey error:', error);
    throw error;
  }
};

// @desc    Update a system setting
// @param   key - Setting key
// @param   value - New setting value
// @param   updatedByStaffId - Staff ID who made the update (optional)
// @returns Updated setting object or null if not found
const updateSystemSetting = async (key, value, updatedByStaffId = null) => {
  try {
    // Update the setting
    const [result] = await pool.query(
      `UPDATE system_settings
       SET setting_value = ?, updated_by_staff_id = ?, updated_at = NOW()
       WHERE setting_key = ?`,
      [value, updatedByStaffId, key]
    );

    // Check if setting was found
    if (result.affectedRows === 0) {
      return {
        success: false,
        message: 'System setting not found',
        code: 'NOT_FOUND'
      };
    }

    // Fetch and return the updated setting
    const [updatedSetting] = await pool.query(
      `SELECT setting_key, setting_value, description, updated_at
       FROM system_settings
       WHERE setting_key = ?`,
      [key]
    );

    return {
      success: true,
      data: updatedSetting[0]
    };
  } catch (error) {
    console.error('❌ updateSystemSetting error:', error);
    throw error;
  }
};

// @desc    Get admin dashboard overview
// @returns System-wide summary for the admin dashboard
const getDashboardOverview = async () => {
  try {
    const [[branchRow]] = await pool.query('SELECT COUNT(*) AS totalBranches FROM branches');
    const [[staffRow]] = await pool.query('SELECT COUNT(*) AS totalStaff FROM staff_profiles');
    const [[customerRow]] = await pool.query('SELECT COUNT(*) AS totalCustomers FROM customer_profiles');
    const [[ticketRow]] = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('ACTIVE','RENEWED') THEN 1 ELSE 0 END), 0) AS activeTickets,
        COALESCE(SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END), 0) AS overdueTickets,
        COALESCE(SUM(CASE WHEN status = 'OVERDUE' AND DATEDIFF(CURDATE(), due_date) >= 30 THEN 1 ELSE 0 END), 0) AS auctionCandidates,
        COALESCE(SUM(CASE WHEN status IN ('ACTIVE','RENEWED','OVERDUE') THEN loan_amount ELSE 0 END), 0) AS portfolioValue
      FROM pawn_tickets
    `);
    const [[reverseRow]] = await pool.query(
      `SELECT COUNT(*) AS pendingReversePawning FROM reverse_pawning_requests WHERE status = 'PENDING'`
    );
    const [[smsRow]] = await pool.query(
      `SELECT COUNT(*) AS smsFailed FROM sms_reminder_logs WHERE status = 'FAILED'`
    );
    const [[closedRow]] = await pool.query(
      `SELECT COUNT(*) AS branchClosedToday FROM branches WHERE status = 'INACTIVE'`
    );
    const [[rateRow]] = await pool.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'ANNUAL_INTEREST_RATE' LIMIT 1`
    );

    const [branchActivity] = await pool.query(
      `SELECT
         b.branch_code AS branchCode,
         b.branch_name AS branchName,
         COALESCE(COUNT(DISTINCT CASE WHEN DATE(t.issue_date) = CURDATE() THEN t.ticket_id END), 0) AS newTickets,
         COALESCE(COUNT(DISTINCT CASE WHEN DATE(p.payment_date) = CURDATE() THEN p.payment_id END), 0) AS payments,
         COALESCE(COUNT(DISTINCT CASE WHEN t.status = 'OVERDUE' THEN t.ticket_id END), 0) AS overdue
       FROM branches b
       LEFT JOIN pawn_tickets t ON t.branch_id = b.branch_id
       LEFT JOIN payments p ON p.branch_id = b.branch_id
       GROUP BY b.branch_id, b.branch_code, b.branch_name
       ORDER BY newTickets DESC, payments DESC, overdue DESC
       LIMIT 5`
    );

    const [overdueList] = await pool.query(
      `SELECT
         pt.receipt_no AS receiptNo,
         b.branch_name AS branchName,
         DATE(pt.due_date) AS dueDate,
         DATEDIFF(CURDATE(), pt.due_date) AS daysOverdue
       FROM pawn_tickets pt
       JOIN branches b ON pt.branch_id = b.branch_id
       WHERE pt.status = 'OVERDUE'
       ORDER BY daysOverdue DESC, pt.due_date ASC
       LIMIT 5`
    );

    return {
      success: true,
      data: {
        summary: {
          totalBranches: Number(branchRow.totalBranches || 0),
          totalStaff: Number(staffRow.totalStaff || 0),
          totalCustomers: Number(customerRow.totalCustomers || 0),
          activeTickets: Number(ticketRow.activeTickets || 0),
          overdueTickets: Number(ticketRow.overdueTickets || 0),
          auctionCandidates: Number(ticketRow.auctionCandidates || 0),
          portfolioValue: Number(ticketRow.portfolioValue || 0),
          pendingReversePawning: Number(reverseRow.pendingReversePawning || 0),
          smsFailed: Number(smsRow.smsFailed || 0),
          branchClosedToday: Number(closedRow.branchClosedToday || 0),
          annualInterestRate: Number(rateRow?.setting_value || 0)
        },
        branchActivity: branchActivity.map((row) => ({
          branchCode: row.branchCode,
          branchName: row.branchName,
          newTickets: Number(row.newTickets || 0),
          payments: Number(row.payments || 0),
          overdue: Number(row.overdue || 0)
        })),
        overdueList: overdueList.map((row) => ({
          receiptNo: row.receiptNo,
          branchName: row.branchName,
          dueDate: row.dueDate,
          daysOverdue: Number(row.daysOverdue || 0)
        }))
      }
    };
  } catch (error) {
    console.error('❌ getDashboardOverview error:', error);
    throw error;
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
  getSystemSettingByKey,
  updateSystemSetting,
  getDashboardOverview
};
