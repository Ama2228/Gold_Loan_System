const bcrypt = require('bcryptjs');
const { pool } = require('../../config/database');

// @desc    Get all staff with pagination
// @param   page - Page number (1-indexed)
// @param   limit - Records per page
// @param   search - Optional search term (name, NIC, username)
// @returns Paginated staff list with user details
const getStaff = async (page = 1, limit = 10, search = null) => {
  try {
    const offset = (page - 1) * limit;

    // Build search WHERE clause if provided
    let searchWhereClause = '';
    let searchParams = [];
    if (search) {
      searchWhereClause = `WHERE u.full_name LIKE ? OR u.nic LIKE ?`;
      searchParams = [`%${search}%`, `%${search}%`];
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT s.staff_id) as total
      FROM staff_profiles s
      JOIN users u ON s.staff_id = u.user_id
      JOIN branches b ON s.branch_id = b.branch_id
      ${searchWhereClause}
    `;
    const [[{ total }]] = await pool.query(countQuery, searchParams);

    // Get paginated staff with roles
    const dataQuery = `
      SELECT 
        u.user_id,
        u.nic,
        u.full_name,
        u.status,
        s.staff_id,
        s.branch_id,
        b.branch_code,
        b.branch_name,
        s.phone,
        s.joined_date,
        GROUP_CONCAT(r.role_name SEPARATOR ',') as roles
      FROM staff_profiles s
      JOIN users u ON s.staff_id = u.user_id
      JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      ${searchWhereClause}
      GROUP BY s.staff_id, u.user_id
      ORDER BY u.full_name
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...searchParams, limit, offset];
    const [staff] = await pool.query(dataQuery, queryParams);

    // Format roles array
    const formattedStaff = staff.map(s => ({
      ...s,
      roles: s.roles ? s.roles.split(',') : []
    }));

    return {
      success: true,
      data: formattedStaff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('❌ getStaff error:', error);
    throw error;
  }
};

// @desc    Create new staff account
// @param   data - { nic, full_name, password, roles[], branch_id, phone, joined_date }
// @returns Created staff object with roles
const createStaff = async (data) => {
  let connection;
  try {
    const { nic, full_name, password, roles, branch_id, phone, joined_date } = data;

    // Validate required fields
    if (!nic || !full_name || !password || !roles || !branch_id) {
      return {
        success: false,
        message: 'Missing required fields: nic, full_name, password, roles, branch_id'
      };
    }

    // Validate roles array
    if (!Array.isArray(roles) || roles.length === 0) {
      return {
        success: false,
        message: 'At least one role must be assigned'
      };
    }

    // Validate roles are valid
    const validRoles = ['STAFF', 'MANAGER', 'ADMIN'];
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        return {
          success: false,
          message: `Invalid role: ${role}. Must be one of: STAFF, MANAGER, ADMIN`
        };
      }
    }

    // Check if NIC already exists
    const [existingUser] = await pool.query(
      `SELECT user_id FROM users WHERE nic = ?`,
      [nic]
    );
    if (existingUser.length > 0) {
      return {
        success: false,
        message: 'NIC already exists',
        code: 'DUPLICATE_NIC'
      };
    }

    // Check if branch exists and is active
    const [branch] = await pool.query(
      `SELECT branch_id FROM branches WHERE branch_id = ? AND status = 'ACTIVE'`,
      [branch_id]
    );
    if (branch.length === 0) {
      return {
        success: false,
        message: 'Branch not found or inactive',
        code: 'INVALID_BRANCH'
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get transaction connection
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Insert into users table
      const [userResult] = await connection.query(
        `INSERT INTO users (nic, password_hash, full_name, status)
         VALUES (?, ?, ?, 'ACTIVE')`,
        [nic, passwordHash, full_name]
      );
      const userId = userResult.insertId;

      // 2. Insert into user_roles table
      for (const roleName of roles) {
        const [roleRow] = await connection.query(
          `SELECT role_id FROM roles WHERE role_name = ?`,
          [roleName]
        );

        if (roleRow.length === 0) {
          throw new Error(`Role ${roleName} not found`);
        }

        await connection.query(
          `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
          [userId, roleRow[0].role_id]
        );
      }

      // 3. Insert into staff_profiles table
      const staffJoinedDate = joined_date || new Date().toISOString().split('T')[0];
      await connection.query(
        `INSERT INTO staff_profiles (staff_id, branch_id, phone, status, joined_date)
         VALUES (?, ?, ?, 'ACTIVE', ?)`,
        [userId, branch_id, phone || null, staffJoinedDate]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      // Fetch and return created staff with roles
      const [newStaff] = await pool.query(
        `SELECT 
          u.user_id,
          u.nic,
          u.full_name,
          u.status,
          s.staff_id,
          s.branch_id,
          b.branch_code,
          b.branch_name,
          s.phone,
          s.joined_date,
          GROUP_CONCAT(r.role_name SEPARATOR ',') as roles
        FROM staff_profiles s
        JOIN users u ON s.staff_id = u.user_id
        JOIN branches b ON s.branch_id = b.branch_id
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.user_id = ?
        GROUP BY u.user_id`,
        [userId]
      );

      if (newStaff.length === 0) {
        throw new Error('Failed to retrieve created staff');
      }

      const staff = newStaff[0];
      return {
        success: true,
        data: {
          ...staff,
          roles: staff.roles ? staff.roles.split(',') : []
        }
      };
    } catch (innerError) {
      await connection.rollback();
      throw innerError;
    }
  } catch (error) {
    console.error('❌ createStaff error:', error);
    if (connection) {
      connection.release();
    }
    throw error;
  }
};

// @desc    Update staff profile
// @param   staffId - Staff user ID
// @param   data - { branch_id, phone, status }
// @returns Updated staff object
const updateStaff = async (staffId, data) => {
  try {
    // Check if staff exists
    const [existingStaff] = await pool.query(
      `SELECT s.staff_id FROM staff_profiles s WHERE s.staff_id = ?`,
      [staffId]
    );
    if (existingStaff.length === 0) {
      return {
        success: false,
        message: 'Staff not found',
        code: 'NOT_FOUND'
      };
    }

    // Build dynamic update for staff_profiles
    const staffFields = [];
    const staffValues = [];

    if (data.branch_id !== undefined) {
      // Validate branch exists
      const [branch] = await pool.query(
        `SELECT branch_id FROM branches WHERE branch_id = ? AND status = 'ACTIVE'`,
        [data.branch_id]
      );
      if (branch.length === 0) {
        return {
          success: false,
          message: 'Branch not found or inactive',
          code: 'INVALID_BRANCH'
        };
      }
      staffFields.push('branch_id = ?');
      staffValues.push(data.branch_id);
    }

    if (data.phone !== undefined) {
      staffFields.push('phone = ?');
      staffValues.push(data.phone || null);
    }

    if (data.status !== undefined) {
      // Update both users.status and staff_profiles.status
      if (data.status !== 'ACTIVE' && data.status !== 'INACTIVE') {
        return {
          success: false,
          message: 'Invalid status. Must be ACTIVE or INACTIVE'
        };
      }
      staffFields.push('status = ?');
      staffValues.push(data.status);

      // Also update users table
      await pool.query(
        `UPDATE users SET status = ? WHERE user_id = ?`,
        [data.status, staffId]
      );
    }

    // If no fields to update, return current staff
    if (staffFields.length === 0) {
      const [staff] = await pool.query(
        `SELECT 
          u.user_id,
          u.nic,
          u.full_name,
          u.status,
          s.staff_id,
          s.branch_id,
          b.branch_code,
          b.branch_name,
          s.phone,
          s.joined_date,
          GROUP_CONCAT(r.role_name SEPARATOR ',') as roles
        FROM staff_profiles s
        JOIN users u ON s.staff_id = u.user_id
        JOIN branches b ON s.branch_id = b.branch_id
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.user_id = ?
        GROUP BY u.user_id`,
        [staffId]
      );

      if (staff.length === 0) {
        return {
          success: false,
          message: 'Staff not found',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: {
          ...staff[0],
          roles: staff[0].roles ? staff[0].roles.split(',') : []
        }
      };
    }

    // Execute update
    staffValues.push(staffId);
    await pool.query(
      `UPDATE staff_profiles SET ${staffFields.join(', ')} WHERE staff_id = ?`,
      staffValues
    );

    // Fetch and return updated staff
    const [updatedStaff] = await pool.query(
      `SELECT 
        u.user_id,
        u.nic,
        u.full_name,
        u.status,
        s.staff_id,
        s.branch_id,
        b.branch_code,
        b.branch_name,
        s.phone,
        s.joined_date,
        GROUP_CONCAT(r.role_name SEPARATOR ',') as roles
      FROM staff_profiles s
      JOIN users u ON s.staff_id = u.user_id
      JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE u.user_id = ?
      GROUP BY u.user_id`,
      [staffId]
    );

    if (updatedStaff.length === 0) {
      return {
        success: false,
        message: 'Staff not found after update',
        code: 'NOT_FOUND'
      };
    }

    return {
      success: true,
      data: {
        ...updatedStaff[0],
        roles: updatedStaff[0].roles ? updatedStaff[0].roles.split(',') : []
      }
    };
  } catch (error) {
    console.error('❌ updateStaff error:', error);
    throw error;
  }
};

// @desc    Toggle staff status (ACTIVE <-> INACTIVE)
// @param   staffId - Staff user ID
// @returns Updated staff object
const toggleStaffStatus = async (staffId) => {
  let connection;
  try {
    // Check if staff exists and get current status
    const [existingStaff] = await pool.query(
      `SELECT u.status 
       FROM staff_profiles s
       JOIN users u ON s.staff_id = u.user_id
       WHERE s.staff_id = ?`,
      [staffId]
    );

    if (existingStaff.length === 0) {
      return {
        success: false,
        message: 'Staff not found',
        code: 'NOT_FOUND'
      };
    }

    const currentStatus = existingStaff[0].status;
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Get transaction connection
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update both users and staff_profiles
      await connection.query(
        `UPDATE users SET status = ? WHERE user_id = ?`,
        [newStatus, staffId]
      );

      await connection.query(
        `UPDATE staff_profiles SET status = ? WHERE staff_id = ?`,
        [newStatus, staffId]
      );

      await connection.commit();
      connection.release();

      // Fetch and return updated staff
      const [updatedStaff] = await pool.query(
        `SELECT 
          u.user_id,
          u.nic,
          u.full_name,
          u.status,
          s.staff_id,
          s.branch_id,
          b.branch_code,
          b.branch_name,
          s.phone,
          s.joined_date,
          GROUP_CONCAT(r.role_name SEPARATOR ',') as roles
        FROM staff_profiles s
        JOIN users u ON s.staff_id = u.user_id
        JOIN branches b ON s.branch_id = b.branch_id
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.user_id = ?
        GROUP BY u.user_id`,
        [staffId]
      );

      if (updatedStaff.length === 0) {
        return {
          success: false,
          message: 'Staff not found after status update',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: {
          ...updatedStaff[0],
          roles: updatedStaff[0].roles ? updatedStaff[0].roles.split(',') : []
        }
      };
    } catch (innerError) {
      await connection.rollback();
      throw innerError;
    }
  } catch (error) {
    console.error('❌ toggleStaffStatus error:', error);
    if (connection) {
      connection.release();
    }
    throw error;
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  toggleStaffStatus
};
