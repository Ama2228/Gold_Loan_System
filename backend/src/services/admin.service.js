const { pool } = require('../../config/database');

// @desc    Get all branches
// @returns List of all branches
const listBranches = async () => {
  try {
    const [branches] = await pool.query(
      `SELECT branch_id, branch_code, branch_name, status 
       FROM branches 
       ORDER BY branch_code`
    );

    return {
      success: true,
      data: branches
    };
  } catch (error) {
    console.error('❌ listBranches error:', error);
    throw error;
  }
};

// @desc    Create a new branch
// @param   data - Object with branch details
// @returns Created branch object
const createBranch = async (data) => {
  try {
    const { branch_code, branch_name, address_line1, address_line2, city_id, status } = data;

    const [result] = await pool.query(
      `INSERT INTO branches (branch_code, branch_name, address_line1, address_line2, city_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [branch_code, branch_name, address_line1, address_line2 || null, city_id || null, status]
    );

    // Fetch the inserted branch
    const [insertedBranch] = await pool.query(
      `SELECT branch_id, branch_code, branch_name, address_line1, address_line2, city_id, status
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
    if (data.address_line2 !== undefined) {
      fields.push('address_line2 = ?');
      values.push(data.address_line2);
    }
    if (data.city_id !== undefined) {
      fields.push('city_id = ?');
      values.push(data.city_id);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    // If no fields to update, return current branch
    if (fields.length === 0) {
      const [branch] = await pool.query(
        `SELECT branch_id, branch_code, branch_name, address_line1, address_line2, city_id, status
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
      `SELECT branch_id, branch_code, branch_name, address_line1, address_line2, city_id, status
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

module.exports = {
  listBranches,
  createBranch,
  updateBranch
};
