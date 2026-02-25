const { pool } = require('../../config/database');

class CustomerDashboardService {
  // Get customer dashboard summary
  async getDashboardSummary(customerId) {
    try {
      // Get customer info
      const [customer] = await pool.query(
        `SELECT u.user_id, u.nic, u.full_name, cp.email, cp.phone, COALESCE(c.city_name, '') as city, cp.status, cp.registered_date
         FROM users u
         LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
         LEFT JOIN cities c ON cp.city_id = c.city_id
         WHERE u.user_id = ?`,
        [customerId]
      );

      if (customer.length === 0) {
        return { success: false, message: 'Customer not found' };
      }

      // Get active pawns count
      const [activeTickets] = await pool.query(
        `SELECT COUNT(*) as count FROM pawn_tickets WHERE customer_id = ? AND ticket_status = 'ACTIVE'`,
        [customerId]
      );

      // Get total amount pledged
      const [totalPledged] = await pool.query(
        `SELECT COALESCE(SUM(loan_amount), 0) as total FROM pawn_tickets WHERE customer_id = ? AND ticket_status = 'ACTIVE'`,
        [customerId]
      );

      // Get recent transactions
      const [recentTransactions] = await pool.query(
        `SELECT pawn_ticket_id, ticket_no, created_date, loan_amount, item_description, ticket_status
         FROM pawn_tickets
         WHERE customer_id = ?
         ORDER BY created_date DESC
         LIMIT 5`,
        [customerId]
      );

      return {
        success: true,
        data: {
          customer: customer[0],
          stats: {
            active_pawns: activeTickets[0].count,
            total_amount_pledged: totalPledged[0].total,
            member_since: customer[0].registered_date
          },
          recent_transactions: recentTransactions
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all customer receipts
  async getReceipts(customerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    try {
      const [receipts] = await pool.query(
        `SELECT pawn_ticket_id as id, ticket_no as receipt_no, created_date, 
                item_description, item_weight, loan_amount, interest_rate, 
                maturity_date, ticket_status as status, pawn_agent_id
         FROM pawn_tickets
         WHERE customer_id = ?
         ORDER BY created_date DESC
         LIMIT ? OFFSET ?`,
        [customerId, limit, offset]
      );

      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM pawn_tickets WHERE customer_id = ?',
        [customerId]
      );

      const total = countResult[0].total;

      return {
        success: true,
        data: receipts,
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

  // Get single receipt details
  async getReceiptByNo(customerId, receiptNo) {
    try {
      const [receipt] = await pool.query(
        `SELECT pt.*, u.full_name as customer_name, b.branch_name
         FROM pawn_tickets pt
         LEFT JOIN users u ON pt.customer_id = u.user_id
         LEFT JOIN branches b ON pt.branch_id = b.branch_id
         WHERE pt.ticket_no = ? AND pt.customer_id = ?`,
        [receiptNo, customerId]
      );

      if (receipt.length === 0) {
        return { success: false, message: 'Receipt not found' };
      }

      // Get transaction history for this receipt
      const [history] = await pool.query(
        `SELECT * FROM ticket_status_history 
         WHERE pawn_ticket_id = ?
         ORDER BY status_change_date DESC`,
        [receipt[0].pawn_ticket_id]
      );

      return {
        success: true,
        data: {
          receipt: receipt[0],
          history: history
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CustomerDashboardService();
