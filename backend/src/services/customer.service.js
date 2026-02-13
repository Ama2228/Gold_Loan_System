const { pool } = require('../../config/database');

class CustomerService {
  // Get all customers with pagination
  async getAllCustomers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    try {
      const [customers] = await pool.query(
        `SELECT u.user_id as customer_id, u.nic, u.full_name, cp.email, cp.phone as mobile_number,
                cp.address_line1, cp.address_line2, cp.city, cp.status, cp.registered_date as created_at,
                b.branch_name
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         LEFT JOIN branches b ON cp.registered_branch_id = b.branch_id
         WHERE EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'CUSTOMER' AND ur.user_id = u.user_id)
         ORDER BY cp.registered_date DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const [countResult] = await pool.query(
        `SELECT COUNT(DISTINCT u.user_id) as total 
         FROM users u 
         WHERE EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'CUSTOMER' AND ur.user_id = u.user_id)`
      );
      const total = countResult[0].total;

      return {
        success: true,
        data: customers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get single customer by ID
  async getCustomerById(customerId) {
    try {
      const [customers] = await pool.query(
        `SELECT u.user_id as customer_id, u.nic, u.full_name, cp.email, cp.phone as mobile_number,
                cp.address_line1, cp.address_line2, cp.city, cp.status, cp.registered_date,
                b.branch_name
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         LEFT JOIN branches b ON cp.registered_branch_id = b.branch_id
         WHERE u.user_id = ?`,
        [customerId]
      );

      if (customers.length === 0) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      return {
        success: true,
        data: customers[0]
      };
    } catch (error) {
      throw error;
    }
  }

  // Get customer by NIC
  async getCustomerByNic(nic) {
    try {
      const [customers] = await pool.query(
        `SELECT u.user_id as customer_id, u.nic, u.full_name, cp.email, cp.phone as mobile_number,
                cp.address_line1, cp.address_line2, cp.city, cp.status
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         WHERE u.nic = ?`,
        [nic]
      );

      if (customers.length === 0) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      return {
        success: true,
        data: customers[0]
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new customer
  async createCustomer(customerData, branchId) {
    const { nic, fullName, email, mobileNumber, addressLine1, addressLine2, city } = customerData;

    let connection;
    try {
      connection = await pool.getConnection();

      // Check if customer already exists
      const [existing] = await connection.query(
        'SELECT user_id FROM users WHERE nic = ?',
        [nic]
      );

      if (existing.length > 0) {
        return {
          success: false,
          message: 'Customer with this NIC already exists'
        };
      }

      // Create user first
      const [userResult] = await connection.query(
        `INSERT INTO users (nic, full_name, status) VALUES (?, ?, 'ACTIVE')`,
        [nic, fullName]
      );

      const userId = userResult.insertId;

      // Assign CUSTOMER role
      const [roles] = await connection.query(
        'SELECT role_id FROM roles WHERE role_name = ?',
        ['CUSTOMER']
      );

      if (roles.length > 0) {
        await connection.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roles[0].role_id]
        );
      }

      // Create customer profile
      await connection.query(
        `INSERT INTO customer_profiles (customer_id, registered_branch_id, phone, email, address_line1, address_line2, city, registered_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [userId, branchId || 1, mobileNumber, email, addressLine1, addressLine2, city]
      );

      return {
        success: true,
        message: 'Customer created successfully',
        data: {
          customer_id: userId,
          nic,
          full_name: fullName,
          email,
          mobile_number: mobileNumber,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          status: 'ACTIVE'
        }
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Update customer
  async updateCustomer(customerId, customerData) {
    const { fullName, email, mobileNumber, addressLine1, addressLine2, city } = customerData;

    try {
      // Update user table
      await pool.query(
        `UPDATE users SET full_name = ? WHERE user_id = ?`,
        [fullName, customerId]
      );

      // Update customer profile
      const [result] = await pool.query(
        `UPDATE customer_profiles 
         SET email = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?
         WHERE customer_id = ?`,
        [email, mobileNumber, addressLine1, addressLine2, city, customerId]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      return {
        success: true,
        message: 'Customer updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete customer (soft delete)
  async deleteCustomer(customerId) {
    try {
      const [result] = await pool.query(
        `UPDATE customer_profiles SET status = 'INACTIVE' WHERE customer_id = ?`,
        [customerId]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      return {
        success: true,
        message: 'Customer deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Search customers
  async searchCustomers(query) {
    try {
      const [customers] = await pool.query(
        `SELECT u.user_id as customer_id, u.nic, u.full_name, cp.email, cp.phone as mobile_number, cp.status
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         WHERE u.full_name LIKE ? OR u.nic LIKE ? OR cp.phone LIKE ? OR cp.email LIKE ?
         LIMIT 20`,
        [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
      );

      return {
        success: true,
        data: customers
      };
    } catch (error) {
      throw error;
    }
  }

  // ========================================================
  // CUSTOMER-FACING FUNCTIONS (for logged-in customers)
  // ========================================================

  /**
   * Get customer dashboard summary
   * @param {number} customerId - Customer user ID from JWT
   * @returns {Object} Dashboard data with active receipts and total loan amount
   */
  async getDashboard(customerId) {
    try {
      // Query pawn_tickets where customer_id matches and status is ACTIVE or OVERDUE
      const [results] = await pool.query(
        `SELECT 
          COUNT(CASE WHEN ticket_status = 'ACTIVE' THEN 1 END) as activeReceiptCount,
          COALESCE(SUM(CASE WHEN ticket_status IN ('ACTIVE', 'OVERDUE') THEN loan_amount ELSE 0 END), 0) as totalLoanAmount,
          COUNT(CASE WHEN ticket_status = 'OVERDUE' THEN 1 END) as overdueCount
         FROM pawn_tickets
         WHERE customer_id = ? AND ticket_status IN ('ACTIVE', 'OVERDUE')`,
        [customerId]
      );

      return {
        success: true,
        data: {
          activeReceiptCount: results[0].activeReceiptCount || 0,
          totalLoanAmount: parseFloat(results[0].totalLoanAmount) || 0,
          overdueCount: results[0].overdueCount || 0
        }
      };
    } catch (error) {
      console.error('Service error - getDashboard:', error);
      throw error;
    }
  }

  /**
   * Get all receipts for a customer
   * @param {number} customerId - Customer user ID from JWT
   * @returns {Object} List of receipts
   */
  async getReceipts(customerId) {
    try {
      // Return list of receipts ordered by issue_date descending
      const [receipts] = await pool.query(
        `SELECT 
          pawn_ticket_id,
          ticket_no as receipt_no,
          loan_amount,
          created_date as issue_date,
          maturity_date as due_date,
          ticket_status as status,
          interest_rate as annual_interest_rate,
          item_description,
          item_weight
         FROM pawn_tickets
         WHERE customer_id = ?
         ORDER BY created_date DESC`,
        [customerId]
      );

      return {
        success: true,
        data: receipts
      };
    } catch (error) {
      console.error('Service error - getReceipts:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific receipt
   * @param {number} customerId - Customer user ID from JWT
   * @param {string} receiptNo - Receipt/ticket number
   * @returns {Object} Receipt details with gold articles and payments
   */
  async getReceiptDetail(customerId, receiptNo) {
    try {
      // First fetch ticket by receipt_no and customer_id
      const [tickets] = await pool.query(
        `SELECT 
          pt.*,
          b.branch_name,
          b.branch_code,
          u.full_name as customer_name
         FROM pawn_tickets pt
         LEFT JOIN branches b ON pt.branch_id = b.branch_id
         LEFT JOIN users u ON pt.customer_id = u.user_id
         WHERE pt.ticket_no = ? AND pt.customer_id = ?`,
        [receiptNo, customerId]
      );

      // If not found return null
      if (tickets.length === 0) {
        return {
          success: false,
          message: 'Receipt not found or access denied'
        };
      }

      const receipt = tickets[0];
      const ticketId = receipt.pawn_ticket_id;

      // Fetch gold_articles by ticket_id
      const [goldArticles] = await pool.query(
        `SELECT 
          article_id,
          article_description,
          weight_grams,
          purity_karats,
          appraised_value,
          article_status
         FROM gold_articles
         WHERE pawn_ticket_id = ?
         ORDER BY article_id`,
        [ticketId]
      );

      // Fetch payments by ticket_id ordered by payment_date desc
      const [payments] = await pool.query(
        `SELECT 
          payment_id,
          payment_date,
          payment_amount,
          payment_type,
          payment_method,
          remarks
         FROM payments
         WHERE pawn_ticket_id = ?
         ORDER BY payment_date DESC`,
        [ticketId]
      );

      // Return combined data
      return {
        success: true,
        data: {
          receipt,
          goldArticles,
          payments
        }
      };
    } catch (error) {
      console.error('Service error - getReceiptDetail:', error);
      throw error;
    }
  }
}

module.exports = new CustomerService();
