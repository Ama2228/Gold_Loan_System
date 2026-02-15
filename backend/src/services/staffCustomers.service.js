const { pool } = require('../../config/database');
const bcrypt = require('bcryptjs');

// @desc    Create a new customer
// @param   data - Object with customer details
// @param   userInfo - Object with user_id and roles array
// @returns Created customer basic info
const createCustomer = async (data, userInfo) => {
  const connection = await pool.getConnection();
  
  try {
    // Begin transaction
    await connection.beginTransaction();
    console.log('🔄 Transaction started');

    const {
      nic,
      full_name,
      password,
      phone,
      email,
      address_line1,
      address_line2,
      branch_id,
      occupation_id,
      city_id
    } = data;

    // Check if NIC already exists
    const [existingUsers] = await connection.query(
      'SELECT user_id FROM users WHERE nic = ?',
      [nic]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      const error = new Error('Customer with this NIC already exists');
      error.code = 'ER_DUP_ENTRY';
      throw error;
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('🔒 Password hashed');

    // Insert into users table
    const [userResult] = await connection.query(
      `INSERT INTO users (nic, password_hash, full_name, status) 
       VALUES (?, ?, ?, 'ACTIVE')`,
      [nic, passwordHash, full_name]
    );

    const userId = userResult.insertId;
    console.log(`✅ User created with ID: ${userId}`);

    // Get CUSTOMER role ID from roles table
    const [customerRole] = await connection.query(
      'SELECT role_id FROM roles WHERE role_name = ?',
      ['CUSTOMER']
    );

    if (customerRole.length === 0) {
      await connection.rollback();
      throw new Error('CUSTOMER role not found in database');
    }

    const roleId = customerRole[0].role_id;

    // Insert CUSTOMER role into user_roles
    await connection.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleId]
    );
    console.log('✅ CUSTOMER role assigned');

    // Insert into customer_profiles
    await connection.query(
      `INSERT INTO customer_profiles 
       (customer_id, registered_branch_id, occupation_id, phone, email, 
        address_line1, address_line2, city_id, status, registered_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', CURDATE())`,
      [userId, branch_id, occupation_id, phone, email, address_line1, address_line2, city_id]
    );
    console.log('✅ Customer profile created');

    // Get staff's branch_id from staff_profiles
    const [staffProfile] = await connection.query(
      'SELECT branch_id FROM staff_profiles WHERE staff_id = ?',
      [userInfo.user_id]
    );

    if (staffProfile.length === 0) {
      await connection.rollback();
      throw new Error('Staff profile not found for activity logging');
    }

    const staffBranchId = staffProfile[0].branch_id;

    // Determine role_name (prefer STAFF/MANAGER from roles array)
    let roleName = 'STAFF'; // Default
    if (userInfo.roles && userInfo.roles.length > 0) {
      // Use the first role that matches STAFF or MANAGER
      const staffRole = userInfo.roles.find(role => 
        role === 'STAFF' || role === 'MANAGER'
      );
      if (staffRole) {
        roleName = staffRole;
      }
    }

    // Insert activity log
    await connection.query(
      `INSERT INTO activity_logs 
       (branch_id, user_id, role_name, action, entity_type, entity_id, description) 
       VALUES (?, ?, ?, 'CREATE_CUSTOMER', 'CUSTOMER', ?, ?)`,
      [
        staffBranchId,
        userInfo.user_id,
        roleName,
        userId,
        `Created customer ${nic}`
      ]
    );
    console.log('✅ Activity logged');

    // Commit transaction
    await connection.commit();
    console.log('✅ Transaction committed');

    // Return created customer basic info
    return {
      user_id: userId,
      nic,
      full_name
    };
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('❌ Transaction rolled back:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// @desc    Get all customers with pagination and search
// @param   options - Object with page, limit, search, offset
// @returns Paginated list of customers with total count
const getCustomers = async ({ page = 1, limit = 10, search = '', offset = 0 }) => {
  try {
    // Build base query with joins
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM users u
      JOIN customer_profiles c ON c.customer_id = u.user_id
      LEFT JOIN occupations o ON o.occupation_id = c.occupation_id
      LEFT JOIN cities ci ON ci.city_id = c.city_id
      WHERE c.status = 'ACTIVE'
    `;

    let dataQuery = `
      SELECT 
        c.customer_id,
        u.full_name,
        u.nic,
        c.phone,
        o.occupation_name,
        ci.city_name,
        c.status
      FROM users u
      JOIN customer_profiles c ON c.customer_id = u.user_id
      LEFT JOIN occupations o ON o.occupation_id = c.occupation_id
      LEFT JOIN cities ci ON ci.city_id = c.city_id
      WHERE c.status = 'ACTIVE'
    `;

    const queryParams = [];
    const countParams = [];

    // If search exists, add WHERE conditions
    if (search && search.trim() !== '') {
      const searchPattern = `%${search}%`;
      countQuery += ` AND (u.full_name LIKE ? OR u.nic LIKE ?)`;
      dataQuery += ` AND (u.full_name LIKE ? OR u.nic LIKE ?)`;
      countParams.push(searchPattern, searchPattern);
      queryParams.push(searchPattern, searchPattern);
    }

    // Count total records
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    // Add ordering and pagination
    dataQuery += ` ORDER BY c.registered_date DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Get paginated customers
    const [customers] = await pool.query(dataQuery, queryParams);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: customers
    };
  } catch (error) {
    console.error('❌ getCustomers service error:', error);
    throw error;
  }
};

// @desc    List all customers with pagination (kept for backward compatibility)
// @param   page - Page number (1-indexed)
// @param   limit - Records per page
// @returns Paginated list of customers
const listCustomers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return getCustomers({ page, limit, search: '', offset });
};

// @desc    Get customer by ID
// @param   customerId - Customer ID
// @returns Customer object with full details
const getCustomerById = async (customerId) => {
  try {
    const [customers] = await pool.query(
      `SELECT 
         cp.customer_id,
         u.nic,
         u.full_name,
         cp.phone,
         cp.email,
         cp.address_line1,
         cp.address_line2,
         cp.city_id,
         c.city_name,
         d.district_id,
         d.district_name,
         cp.occupation_id,
         o.occupation_name,
         cp.status,
         cp.registered_date,
         b.branch_id as registered_branch_id,
         b.branch_name as registered_branch,
         b.branch_code
       FROM customer_profiles cp
       INNER JOIN users u ON cp.customer_id = u.user_id
       LEFT JOIN branches b ON cp.registered_branch_id = b.branch_id
       LEFT JOIN cities c ON cp.city_id = c.city_id
       LEFT JOIN districts d ON c.district_id = d.district_id
       LEFT JOIN occupations o ON cp.occupation_id = o.occupation_id
       WHERE cp.customer_id = ?`,
      [customerId]
    );

    return customers.length > 0 ? customers[0] : null;
  } catch (error) {
    console.error('❌ getCustomerById service error:', error);
    throw error;
  }
};

// @desc    Search customers by NIC, name, or phone
// @param   query - Search query string (min 2 chars)
// @returns Array of matching customers (max 10, ordered by latest)
const searchCustomers = async (query) => {
  try {
    const searchPattern = `%${query}%`;

    const [customers] = await pool.query(
      `SELECT 
         cp.customer_id,
         u.nic,
         u.full_name,
         cp.phone,
         cp.email,
         cp.city_id,
         c.city_name,
         cp.status,
         cp.registered_date,
         b.branch_name as registered_branch
       FROM customer_profiles cp
       INNER JOIN users u ON cp.customer_id = u.user_id
       LEFT JOIN branches b ON cp.registered_branch_id = b.branch_id
       LEFT JOIN cities c ON cp.city_id = c.city_id
       WHERE cp.status = 'ACTIVE'
         AND (u.full_name LIKE ? OR u.nic LIKE ?)
       ORDER BY cp.registered_date DESC
       LIMIT 10`,
      [searchPattern, searchPattern]
    );

    return customers;
  } catch (error) {
    console.error('❌ searchCustomers service error:', error);
    throw error;
  }
};

// @desc    Update customer
// @param   customerId - Customer ID
// @param   updateData - Object with fields to update: {full_name, phone, email, occupation_id}
// @returns Updated customer object
const updateCustomer = async (customerId, updateData) => {
  const connection = await pool.getConnection();
  
  try {
    // Begin transaction
    await connection.beginTransaction();
    console.log('🔄 Transaction started for update');

    // Check if customer exists
    const [existingCustomer] = await connection.query(
      'SELECT customer_id FROM customer_profiles WHERE customer_id = ?',
      [customerId]
    );

    if (existingCustomer.length === 0) {
      await connection.rollback();
      return null;
    }

    // Update users table (full_name only)
    if (updateData.full_name) {
      await connection.query(
        'UPDATE users SET full_name = ? WHERE user_id = ?',
        [updateData.full_name, customerId]
      );
      console.log('✅ Updated full_name in users table');
    }

    // Update customer_profiles (phone, email, occupation_id)
    const profileUpdates = [];
    const profileValues = [];

    if (updateData.phone !== undefined) {
      profileUpdates.push('phone = ?');
      profileValues.push(updateData.phone);
    }
    if (updateData.email !== undefined) {
      profileUpdates.push('email = ?');
      profileValues.push(updateData.email);
    }
    if (updateData.occupation_id !== undefined) {
      profileUpdates.push('occupation_id = ?');
      profileValues.push(updateData.occupation_id);
    }

    if (profileUpdates.length > 0) {
      profileValues.push(customerId);
      await connection.query(
        `UPDATE customer_profiles SET ${profileUpdates.join(', ')} WHERE customer_id = ?`,
        profileValues
      );
      console.log('✅ Updated customer_profiles');
    }

    // Commit transaction
    await connection.commit();
    console.log('✅ Transaction committed');

    // Fetch and return updated customer
    const updatedCustomer = await getCustomerById(customerId);
    return updatedCustomer;
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('❌ Transaction rolled back:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// @desc    Delete customer (soft delete)
// @param   customerId - Customer ID
// @returns Boolean indicating success
const deleteCustomer = async (customerId) => {
  const connection = await pool.getConnection();
  
  try {
    // Begin transaction
    await connection.beginTransaction();
    console.log('🔄 Transaction started for soft delete');

    // Check if customer exists
    const [existingCustomer] = await connection.query(
      'SELECT customer_id FROM customer_profiles WHERE customer_id = ?',
      [customerId]
    );

    if (existingCustomer.length === 0) {
      await connection.rollback();
      return null;
    }

    // Update users.status = 'INACTIVE'
    await connection.query(
      "UPDATE users SET status = 'INACTIVE' WHERE user_id = ?",
      [customerId]
    );
    console.log('✅ Set users.status to INACTIVE');

    // Update customer_profiles.status = 'INACTIVE'
    await connection.query(
      "UPDATE customer_profiles SET status = 'INACTIVE' WHERE customer_id = ?",
      [customerId]
    );
    console.log('✅ Set customer_profiles.status to INACTIVE');

    // Commit transaction
    await connection.commit();
    console.log('✅ Transaction committed');

    return true;
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('❌ Transaction rolled back:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// @desc    Get all occupations for dropdown
// @returns Array of occupations
const getOccupations = async () => {
  try {
    const [occupations] = await pool.query(
      `SELECT occupation_id, occupation_name 
       FROM occupations 
       ORDER BY occupation_name`
    );

    return occupations;
  } catch (error) {
    console.error('❌ getOccupations service error:', error);
    throw error;
  }
};

// @desc    Get all cities with districts for dropdown
// @returns Array of cities with district info
const getCities = async () => {
  try {
    const [cities] = await pool.query(
      `SELECT c.city_id, c.city_name, c.district_id, d.district_name
       FROM cities c
       LEFT JOIN districts d ON c.district_id = d.district_id
       ORDER BY c.city_name`
    );

    return cities;
  } catch (error) {
    console.error('❌ getCities service error:', error);
    throw error;
  }
};

// @desc    Get all districts for dropdown
// @returns Array of districts
const getDistricts = async () => {
  try {
    const [districts] = await pool.query(
      `SELECT district_id, district_name 
       FROM districts 
       ORDER BY district_name`
    );

    return districts;
  } catch (error) {
    console.error('❌ getDistricts service error:', error);
    throw error;
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getOccupations,
  getCities,
  getDistricts
};
