const { pool } = require('../../config/database');
const paymentsService = require('./payments.service');

class CustomerService {
  // Get all customers with pagination
  async getAllCustomers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    try {
      const [customers] = await pool.query(
        `SELECT u.user_id as customer_id, u.nic, u.full_name, cp.email, cp.phone as mobile_number,
                cp.address_line1, cp.address_line2, COALESCE(c.city_name, '') as city, cp.status, cp.registered_date as created_at,
                b.branch_name
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         LEFT JOIN branches b ON cp.registered_branch_id = b.branch_id
         LEFT JOIN cities c ON cp.city_id = c.city_id
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
                cp.address_line1, cp.address_line2, COALESCE(c.city_name, '') as city, cp.status, cp.registered_date,
                b.branch_name
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         LEFT JOIN branches b ON cp.registered_branch_id = b.branch_id
         LEFT JOIN cities c ON cp.city_id = c.city_id
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
                cp.address_line1, cp.address_line2, COALESCE(c.city_name, '') as city, cp.status
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         LEFT JOIN cities c ON cp.city_id = c.city_id
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

      let cityId = null;
      if (city) {
        const [cityRows] = await pool.query(
          'SELECT city_id FROM cities WHERE city_name = ? LIMIT 1',
          [city]
        );
        if (cityRows.length > 0) cityId = cityRows[0].city_id;
      }

      const profileUpdates = ['email = ?', 'phone = ?', 'address_line1 = ?', 'address_line2 = ?'];
      const profileValues = [email, mobileNumber, addressLine1, addressLine2];
      if (cityId !== null) {
        profileUpdates.push('city_id = ?');
        profileValues.push(cityId);
      }
      profileValues.push(customerId);

      const [result] = await pool.query(
        `UPDATE customer_profiles SET ${profileUpdates.join(', ')} WHERE customer_id = ?`,
        profileValues
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
   * @returns {Object} Dashboard data with customerInfo, allActiveTickets, stats, recent activity
   */
  async getDashboard(customerId) {
    try {
      const [customerRows] = await pool.query(
        `SELECT u.full_name, u.nic, cp.phone, cp.email, cp.registered_date,
                b.branch_name
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         LEFT JOIN branches b ON cp.registered_branch_id = b.branch_id
         WHERE u.user_id = ?`,
        [customerId]
      );

      const customerInfo = customerRows[0] ? {
        full_name: customerRows[0].full_name,
        nic: customerRows[0].nic,
        phone: customerRows[0].phone,
        email: customerRows[0].email,
        branch_name: customerRows[0].branch_name,
        registered_date: customerRows[0].registered_date
      } : null;

      const [results] = await pool.query(
        `SELECT 
          COUNT(CASE WHEN status IN ('ACTIVE', 'RENEWED') THEN 1 END) as activeReceiptCount,
          COALESCE(SUM(CASE WHEN status IN ('ACTIVE', 'RENEWED', 'OVERDUE') THEN loan_amount ELSE 0 END), 0) as totalLoanAmount,
          COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdueCount
         FROM pawn_tickets
         WHERE customer_id = ? AND status IN ('ACTIVE', 'RENEWED', 'OVERDUE')`,
        [customerId]
      );

      const [allTickets] = await pool.query(
        `SELECT pt.ticket_id, pt.receipt_no, pt.loan_amount, pt.issue_date, pt.due_date, pt.status, b.branch_name
         FROM pawn_tickets pt
         LEFT JOIN branches b ON pt.branch_id = b.branch_id
         WHERE pt.customer_id = ? AND pt.status IN ('ACTIVE', 'RENEWED', 'OVERDUE')
         ORDER BY pt.due_date ASC`,
        [customerId]
      );

      let totalOutstanding = 0;
      const allActiveTickets = [];
      const receiptsNeedingAttention = [];

      for (const t of allTickets) {
        let paymentSummary = null;
        try {
          paymentSummary = await paymentsService.getTicketPaymentSummary(t.ticket_id);
          totalOutstanding += paymentSummary.outstandingPrincipal;
        } catch (e) {
          paymentSummary = { outstandingPrincipal: parseFloat(t.loan_amount), accruedInterest: 0, totalPayable: parseFloat(t.loan_amount) };
          totalOutstanding += parseFloat(t.loan_amount);
        }

        const daysUntilDue = t.due_date ? Math.floor((new Date(t.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        const ticketData = {
          ticket_id: t.ticket_id,
          receipt_no: t.receipt_no,
          loan_amount: parseFloat(t.loan_amount),
          issue_date: t.issue_date,
          due_date: t.due_date,
          status: t.status,
          branch_name: t.branch_name,
          daysUntilDue,
          payment_summary: paymentSummary
        };
        allActiveTickets.push(ticketData);

        if (daysUntilDue !== null && (daysUntilDue < 0 || daysUntilDue <= 7)) {
          receiptsNeedingAttention.push(ticketData);
        }
      }

      const [receiptsNearDue] = await pool.query(
        `SELECT 
          receipt_no,
          loan_amount,
          due_date,
          status,
          DATEDIFF(due_date, CURDATE()) as daysUntilDue
         FROM pawn_tickets
         WHERE customer_id = ? AND status IN ('ACTIVE', 'RENEWED', 'OVERDUE')
           AND (DATEDIFF(due_date, CURDATE()) <= 30 OR due_date < CURDATE())
         ORDER BY due_date ASC
         LIMIT 10`,
        [customerId]
      );

      const [recentPayments] = await pool.query(
        `SELECT 
          pt.receipt_no,
          p.payment_date,
          p.payment_type,
          p.amount,
          p.payment_method
         FROM payments p
         JOIN pawn_tickets pt ON p.ticket_id = pt.ticket_id
         WHERE pt.customer_id = ?
         ORDER BY p.payment_date DESC
         LIMIT 10`,
        [customerId]
      );

      const recentActivity = recentPayments.map(r => ({
        receiptNo: r.receipt_no,
        date: r.payment_date,
        type: r.payment_type,
        amount: parseFloat(r.amount),
        method: r.payment_method
      }));

      const receiptsNearDueFormatted = receiptsNearDue.map(r => ({
        receiptNo: r.receipt_no,
        loanAmount: parseFloat(r.loan_amount),
        dueDate: r.due_date,
        status: r.status,
        daysUntilDue: r.daysUntilDue
      }));

      return {
        success: true,
        data: {
          customerInfo,
          activeReceiptCount: results[0]?.activeReceiptCount || 0,
          totalLoanAmount: parseFloat(results[0]?.totalLoanAmount) || 0,
          overdueCount: results[0]?.overdueCount || 0,
          totalOutstanding: Math.round(totalOutstanding * 100) / 100,
          allActiveTickets,
          receiptsNearDue: receiptsNearDueFormatted,
          receiptsNeedingAttention,
          recentActivity
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
      const [receipts] = await pool.query(
        `SELECT 
          ticket_id,
          receipt_no,
          loan_amount,
          issue_date,
          due_date,
          status,
          annual_interest_rate
         FROM pawn_tickets
         WHERE customer_id = ? AND status IN ('ACTIVE', 'RENEWED', 'OVERDUE')
         ORDER BY issue_date DESC`,
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
         WHERE pt.receipt_no = ? AND pt.customer_id = ?`,
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
      const ticketId = receipt.ticket_id;

      // Fetch gold_articles by ticket_id
      const [goldArticles] = await pool.query(
        `SELECT 
          article_id,
          item_type as article_description,
          net_weight_grams as weight_grams,
          purity_karat as purity_karats,
          assessed_value as appraised_value,
          notes
         FROM gold_articles
         WHERE ticket_id = ?
         ORDER BY article_id`,
        [ticketId]
      );

      // Fetch payments by ticket_id ordered by payment_date desc
      const [payments] = await pool.query(
        `SELECT 
          payment_id,
          payment_date,
          amount as payment_amount,
          payment_type,
          payment_method,
          note as remarks
         FROM payments
         WHERE ticket_id = ?
         ORDER BY payment_date DESC`,
        [ticketId]
      );

      let paymentSummary = null;
      if (['ACTIVE', 'RENEWED', 'OVERDUE'].includes(receipt.status)) {
        try {
          paymentSummary = await paymentsService.getTicketPaymentSummary(ticketId);
        } catch (e) {
          // ignore
        }
      }

      const todayIso = new Date().toISOString().split('T')[0];
      const currentInterestForToday = paymentSummary
        ? Number(paymentSummary.accruedInterest || 0)
        : 0;

      return {
        success: true,
        data: {
          receipt: { ...receipt, ticket_id: ticketId },
          goldArticles,
          payments,
          payment_summary: paymentSummary,
          current_interest_for_today: currentInterestForToday,
          interest_as_of_date: todayIso
        }
      };
    } catch (error) {
      console.error('Service error - getReceiptDetail:', error);
      throw error;
    }
  }
}

module.exports = new CustomerService();
