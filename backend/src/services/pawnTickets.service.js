const mysql = require('mysql2/promise');
const { pool } = require('../../config/database');
const paymentsService = require('./payments.service');

/**
 * ========================================
 * PAWN TICKET SERVICE
 * Core Engine for Pawn Operations
 * ========================================
 * 
 * Features:
 * - Create pawn ticket with gold articles
 * - Calculate advance amount based on karat rates
 * - Validate business rules (min loan, max articles)
 * - Transaction-based operations
 * - Activity logging
 */

class PawnTicketsService {
  /**
   * Generate unique receipt number
   * Format: BRANCH_CODE-YYYYMMDD-SEQNO
   */
  async generateReceiptNo(branchCode, branchId) {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    const query = `
      SELECT COUNT(*) as count 
      FROM pawn_tickets 
      WHERE branch_id = ? AND DATE(issue_date) = CURDATE()
    `;
    
    const [result] = await pool.query(query, [branchId]);
    const seqNo = (result[0].count + 1).toString().padStart(4, '0');
    
    return `${branchCode}-${today}-${seqNo}`;
  }

  /**
   * Get karat rate for calculating advance amount
   */
  async getKaratRate(karat) {
    const query = `
      SELECT advance_value_per_gram 
      FROM karat_advance_rates 
      WHERE karat = ? AND is_active = 1
      LIMIT 1
    `;
    
    const [rows] = await pool.query(query, [karat]);
    
    if (rows.length === 0) {
      throw new Error(`No rate found for ${karat} karat gold`);
    }
    
    return {
      karat,
      rate_per_gram: parseFloat(rows[0].advance_value_per_gram)
    };
  }

  /**
   * Validate gold articles
   * - Max 5 articles per ticket
   * - Weight validation
   * - Karat validation
   */
  validateGoldArticles(articles) {
    // Check max 5 articles
    if (!articles || articles.length === 0) {
      throw new Error('At least 1 gold article required');
    }
    
    if (articles.length > 5) {
      throw new Error('Maximum 5 gold articles allowed per ticket');
    }

    const errors = [];
    
    articles.forEach((article, idx) => {
      const prefix = `Article ${idx + 1}`;
      
      // Check required fields
      if (!article.item_type || article.item_type.trim() === '') {
        errors.push(`${prefix}: item_type is required`);
      }
      
      if (!article.gross_weight_grams || article.gross_weight_grams <= 0) {
        errors.push(`${prefix}: gross_weight_grams must be > 0`);
      }
      
      if (!article.net_weight_grams || article.net_weight_grams <= 0) {
        errors.push(`${prefix}: net_weight_grams must be > 0`);
      }
      
      if (!article.purity_karat || ![8, 10, 12, 14, 16, 18, 20, 22, 24].includes(article.purity_karat)) {
        errors.push(`${prefix}: Invalid purity_karat (must be 8, 10, 12, 14, 16, 18, 20, 22, or 24)`);
      }
      
      if (article.net_weight_grams > article.gross_weight_grams) {
        errors.push(`${prefix}: net_weight_grams cannot exceed gross_weight_grams`);
      }
      
      if (!article.quantity || article.quantity < 1) {
        errors.push(`${prefix}: quantity must be >= 1`);
      }
    });

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }

  /**
   * Calculate advance amount
   * Formula: SUM(net_weight * rate_for_karat) * interest_percentage
   */
  async calculateAdvanceAmount(articles, interestPercentage = 100) {
    let totalAdvance = 0;

    for (const article of articles) {
      const rate = await this.getKaratRate(article.purity_karat);
      const articleValue = article.net_weight_grams * rate.rate_per_gram;
      totalAdvance += articleValue;
    }

    // Apply interest percentage to get final advance amount
    const advanceAmount = (totalAdvance * interestPercentage) / 100;
    
    return Math.round(advanceAmount * 100) / 100; // Round to 2 decimals
  }

  /**
   * Get all active karat advance rates (for staff metadata)
   */
  async getAllKaratRates() {
    const [rows] = await pool.query(
      `SELECT karat, advance_value_per_gram 
       FROM karat_advance_rates 
       WHERE is_active = 1 
       ORDER BY karat`
    );
    return rows.map(r => ({
      karat: r.karat,
      advance_value_per_gram: parseFloat(r.advance_value_per_gram)
    }));
  }

  /**
   * Get all active pawning periods (for staff metadata)
   */
  async getAllPawningPeriods() {
    const [rows] = await pool.query(
      `SELECT period_id, period_name, duration_months 
       FROM pawning_periods 
       WHERE is_active = 1 
       ORDER BY duration_months`
    );
    return rows;
  }

  /**
   * Get pawning period details
   */
  async getPawningPeriod(periodMonths) {
    const query = `
      SELECT period_id, duration_months, period_name
      FROM pawning_periods
      WHERE duration_months = ? AND is_active = 1
      LIMIT 1
    `;
    
    const [rows] = await pool.query(query, [periodMonths]);
    
    if (rows.length === 0) {
      throw new Error(`Invalid pawning period: ${periodMonths} months`);
    }
    
    return rows[0];
  }

  /**
   * Calculate due date based on issue date and pawning period
   */
  calculateDueDate(issueDate, periodMonths) {
    const date = new Date(issueDate);
    // Add months
    date.setMonth(date.getMonth() + periodMonths);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get annual interest rate for ticket
   * Based on system settings
   */
  async getAnnualInterestRate(periodMonths) {
    const query = `
      SELECT setting_value
      FROM system_settings
      WHERE setting_key = 'ANNUAL_INTEREST_RATE'
      LIMIT 1
    `;
    
    const [rows] = await pool.query(query);
    
    if (rows.length === 0) {
      return 18; // Default fallback
    }
    
    return parseFloat(rows[0].setting_value);
  }

  /**
   * CREATE PAWN TICKET - Main Operation
   * 
   * Process:
   * 1. Validate all inputs
   * 2. Validate gold articles
   * 3. Calculate advance amount
   * 4. Generate receipt number
   * 5. Begin transaction
   * 6. Insert into pawn_tickets
   * 7. Insert each gold_article
   * 8. Insert into ticket_status_history
   * 9. Insert activity log
   * 10. Commit
   */
  async createPawnTicket(ticketData, userInfo) {
    const conn = await pool.getConnection();
    
    try {
      // ===== VALIDATION PHASE =====
      
      // 1. Validate required fields
      const { customer_id, branch_id, articles, pawning_period_months, interest_percentage } = ticketData;
      
      if (!customer_id || !branch_id || !articles || !pawning_period_months) {
        throw new Error('Missing required fields: customer_id, branch_id, articles, pawning_period_months');
      }

      // 2. Validate customer exists and is ACTIVE
      const [customerRows] = await conn.query(
        'SELECT u.user_id, u.full_name, cp.status FROM users u INNER JOIN customer_profiles cp ON u.user_id = cp.customer_id WHERE u.user_id = ?',
        [customer_id]
      );
      
      if (customerRows.length === 0) {
        throw new Error('Customer not found');
      }
      
      if (customerRows[0].status !== 'ACTIVE') {
        throw new Error('Customer is not active');
      }

      const customerInfo = customerRows[0];

      // 3. Validate branch exists and is ACTIVE
      const [branchRows] = await conn.query(
        'SELECT branch_code, branch_name FROM branches WHERE branch_id = ? AND status = ? LIMIT 1',
        [branch_id, 'ACTIVE']
      );
      
      if (branchRows.length === 0) {
        throw new Error('Branch not found or is inactive');
      }

      const branchInfo = branchRows[0];

      // 4. Validate staff (creator) exists and is ACTIVE
      const [staffRows] = await conn.query(
        'SELECT staff_id FROM staff_profiles WHERE staff_id = ? AND status = ?',
        [userInfo.user_id, 'ACTIVE']
      );
      
      if (staffRows.length === 0) {
        throw new Error('Staff not found or is inactive');
      }

      // 5. Validate gold articles
      this.validateGoldArticles(articles);

      // 6. Validate pawning period
      const periodInfo = await this.getPawningPeriod(pawning_period_months);

      // ===== CALCULATION PHASE =====

      // 7. Calculate advance amount
      const advanceAmount = await this.calculateAdvanceAmount(articles, interest_percentage || 100);

      // 8. Validate minimum loan amount (5000)
      if (advanceAmount < 5000) {
        throw new Error(`Advance amount (${advanceAmount}) is below minimum loan amount (5000)`);
      }

      // 9. Calculate due date
      const issueDate = new Date().toISOString().split('T')[0];
      const dueDate = this.calculateDueDate(issueDate, pawning_period_months);

      // 10. Get annual interest rate
      const annualInterestRate = await this.getAnnualInterestRate(pawning_period_months);

      // 11. Generate receipt number
      const receiptNo = await this.generateReceiptNo(branchInfo.branch_code, branch_id);

      // ===== TRANSACTION PHASE =====

      await conn.beginTransaction();

      try {
        // 12. Insert into pawn_tickets
        const ticketQuery = `
          INSERT INTO pawn_tickets (
            receipt_no, branch_id, customer_id, created_by_staff_id,
            issue_date, due_date, loan_amount, annual_interest_rate,
            interest_type, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [ticketResult] = await conn.query(ticketQuery, [
          receiptNo,
          branch_id,
          customer_id,
          userInfo.user_id,
          issueDate,
          dueDate,
          advanceAmount,
          annualInterestRate,
          'MONTHLY', // default interest_type
          'ACTIVE'
        ]);

        const ticketId = ticketResult.insertId;

        // 13. Insert gold articles
        for (const article of articles) {
          const articleQuery = `
            INSERT INTO gold_articles (
              ticket_id, item_type, quantity, gross_weight_grams,
              net_weight_grams, purity_karat, assessed_value, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const rate = await this.getKaratRate(article.purity_karat);
          const assessedValue = article.net_weight_grams * rate.rate_per_gram;

          await conn.query(articleQuery, [
            ticketId,
            article.item_type,
            article.quantity || 1,
            article.gross_weight_grams,
            article.net_weight_grams,
            article.purity_karat,
            assessedValue,
            article.notes || null
          ]);
        }

        // 14. Insert into ticket_status_history (initial status)
        const historyQuery = `
          INSERT INTO ticket_status_history (
            ticket_id, old_status, new_status, changed_by_staff_id, remark
          ) VALUES (?, ?, ?, ?, ?)
        `;

        await conn.query(historyQuery, [
          ticketId,
          'ACTIVE', // Both same for initial creation
          'ACTIVE',
          userInfo.user_id,
          'Ticket created'
        ]);

        // 15. Insert activity log
        const activityQuery = `
          INSERT INTO activity_logs (
            branch_id, user_id, role_name, action, entity_type, entity_id, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await conn.query(activityQuery, [
          branch_id,
          userInfo.user_id,
          userInfo.roles[0], // Primary role
          'CREATE',
          'PAWN_TICKET',
          ticketId,
          `Pawn ticket created: Receipt#${receiptNo}, Customer: ${customerInfo.full_name}`
        ]);

        await conn.commit();

        // ===== RESPONSE =====
        return {
          success: true,
          ticket_id: ticketId,
          receipt_no: receiptNo,
          customer_name: customerInfo.full_name,
          branch_name: branchInfo.branch_name,
          issue_date: issueDate,
          due_date: dueDate,
          loan_amount: advanceAmount,
          pawning_period_months: pawning_period_months,
          articles_count: articles.length,
          status: 'ACTIVE',
          message: 'Pawn ticket created successfully'
        };

      } catch (txError) {
        await conn.rollback();
        throw txError;
      }

    } catch (error) {
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * GET TICKET BY RECEIPT NUMBER (with payment summary)
   * Used for Part Payment, Renewal, Redemption flows
   * @param {string} receiptNo - Receipt number (e.g. BRANCH-20260225-0001)
   * @param {number} branchId - Optional branch filter
   */
  async getTicketByReceiptNo(receiptNo, branchId = null) {
    if (!receiptNo || String(receiptNo).trim() === '') {
      throw new Error('Receipt number is required');
    }

    const ticket = await this.getTicketByIdFromReceipt(receiptNo, branchId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    let paymentSummary = null;
    if (['ACTIVE', 'RENEWED', 'OVERDUE'].includes(ticket.status)) {
      try {
        paymentSummary = await paymentsService.getTicketPaymentSummary(ticket.ticket_id);
      } catch (e) {
        // Ticket may be closed; paymentSummary stays null
      }
    }

    return {
      ...ticket,
      payment_summary: paymentSummary
    };
  }

  /**
   * Internal: get ticket by receipt without payment summary
   */
  async getTicketByIdFromReceipt(receiptNo, branchId) {
    let whereClause = "pt.receipt_no = ? AND pt.status != 'REVERSED'";
    const params = [receiptNo.trim()];
    if (branchId) {
      whereClause += ' AND pt.branch_id = ?';
      params.push(branchId);
    }

    const query = `
      SELECT 
        pt.ticket_id, pt.receipt_no, pt.branch_id, pt.customer_id,
        pt.issue_date, pt.due_date, pt.loan_amount, pt.annual_interest_rate,
        pt.interest_type, pt.status, pt.closed_date,
        b.branch_name, b.branch_code,
        cp.customer_id, u.full_name as customer_name, u.nic as customer_nic,
        u2.full_name as staff_name,
        GROUP_CONCAT(
          JSON_OBJECT(
            'article_id', ga.article_id,
            'item_type', ga.item_type,
            'quantity', ga.quantity,
            'gross_weight_grams', ga.gross_weight_grams,
            'net_weight_grams', ga.net_weight_grams,
            'purity_karat', ga.purity_karat,
            'assessed_value', ga.assessed_value,
            'notes', ga.notes
          )
        ) as articles
      FROM pawn_tickets pt
      INNER JOIN branches b ON pt.branch_id = b.branch_id
      INNER JOIN customer_profiles cp ON pt.customer_id = cp.customer_id
      INNER JOIN users u ON cp.customer_id = u.user_id
      INNER JOIN staff_profiles sp ON pt.created_by_staff_id = sp.staff_id
      INNER JOIN users u2 ON sp.staff_id = u2.user_id
      LEFT JOIN gold_articles ga ON pt.ticket_id = ga.ticket_id
      WHERE ${whereClause}
      GROUP BY pt.ticket_id
    `;

    const [rows] = await pool.query(query, params);
    if (rows.length === 0) return null;

    const ticket = rows[0];
    let articles = [];
    if (ticket.articles) {
      try {
        articles = JSON.parse(`[${ticket.articles}]`);
      } catch (e) {
        articles = [];
      }
    }

    return {
      ticket_id: ticket.ticket_id,
      receipt_no: ticket.receipt_no,
      customer: {
        customer_id: ticket.customer_id,
        name: ticket.customer_name,
        nic: ticket.customer_nic
      },
      branch: {
        branch_id: ticket.branch_id,
        name: ticket.branch_name,
        code: ticket.branch_code
      },
      staff_created_by: ticket.staff_name,
      issue_date: ticket.issue_date,
      due_date: ticket.due_date,
      loan_amount: parseFloat(ticket.loan_amount),
      annual_interest_rate: parseFloat(ticket.annual_interest_rate),
      interest_type: ticket.interest_type || 'MONTHLY',
      status: ticket.status,
      closed_date: ticket.closed_date,
      articles_count: articles.length,
      articles: articles
    };
  }

  /**
   * GET TICKET DETAILS
   * Join with articles, customer, branch, staff
   */
  async getTicketById(ticketId) {
    const query = `
      SELECT 
        pt.ticket_id, pt.receipt_no, pt.branch_id, pt.customer_id,
        pt.issue_date, pt.due_date, pt.loan_amount, pt.annual_interest_rate,
        pt.status, pt.closed_date,
        b.branch_name, b.branch_code,
        cp.customer_id, u.full_name as customer_name, u.nic as customer_nic,
        u2.full_name as staff_name,
        GROUP_CONCAT(
          JSON_OBJECT(
            'article_id', ga.article_id,
            'item_type', ga.item_type,
            'quantity', ga.quantity,
            'gross_weight_grams', ga.gross_weight_grams,
            'net_weight_grams', ga.net_weight_grams,
            'purity_karat', ga.purity_karat,
            'assessed_value', ga.assessed_value,
            'notes', ga.notes
          )
        ) as articles
      FROM pawn_tickets pt
      INNER JOIN branches b ON pt.branch_id = b.branch_id
      INNER JOIN customer_profiles cp ON pt.customer_id = cp.customer_id
      INNER JOIN users u ON cp.customer_id = u.user_id
      INNER JOIN staff_profiles sp ON pt.created_by_staff_id = sp.staff_id
      INNER JOIN users u2 ON sp.staff_id = u2.user_id
      LEFT JOIN gold_articles ga ON pt.ticket_id = ga.ticket_id
      WHERE pt.ticket_id = ?
      GROUP BY pt.ticket_id
    `;

    const [rows] = await pool.query(query, [ticketId]);

    if (rows.length === 0) {
      throw new Error('Ticket not found');
    }

    const ticket = rows[0];
    
    // Parse articles JSON
    let articles = [];
    if (ticket.articles) {
      try {
        articles = JSON.parse(`[${ticket.articles}]`);
      } catch (e) {
        articles = [];
      }
    }

    return {
      ticket_id: ticket.ticket_id,
      receipt_no: ticket.receipt_no,
      customer: {
        customer_id: ticket.customer_id,
        name: ticket.customer_name,
        nic: ticket.customer_nic
      },
      branch: {
        branch_id: ticket.branch_id,
        name: ticket.branch_name,
        code: ticket.branch_code
      },
      staff_created_by: ticket.staff_name,
      issue_date: ticket.issue_date,
      due_date: ticket.due_date,
      loan_amount: parseFloat(ticket.loan_amount),
      annual_interest_rate: parseFloat(ticket.annual_interest_rate),
      status: ticket.status,
      closed_date: ticket.closed_date,
      articles_count: articles.length,
      articles: articles
    };
  }

  /**
   * GET TICKETS LIST - With pagination and filters
   */
  async getTickets(branchId, filters = {}) {
    const { page = 1, limit = 10, status = null, customerId = null } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ['pt.branch_id = ?', "pt.status != 'REVERSED'"];
    const params = [branchId];

    if (status) {
      whereConditions.push('pt.status = ?');
      params.push(status);
    }

    if (customerId) {
      whereConditions.push('pt.customer_id = ?');
      params.push(customerId);
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM pawn_tickets pt WHERE ${whereClause}`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    const dataQuery = `
      SELECT 
        pt.ticket_id, pt.receipt_no, pt.branch_id, pt.customer_id,
        pt.issue_date, pt.due_date, pt.loan_amount, pt.status,
        u.full_name as customer_name, u.nic as customer_nic,
        COUNT(ga.article_id) as articles_count
      FROM pawn_tickets pt
      INNER JOIN customer_profiles cp ON pt.customer_id = cp.customer_id
      INNER JOIN users u ON cp.customer_id = u.user_id
      LEFT JOIN gold_articles ga ON pt.ticket_id = ga.ticket_id
      WHERE ${whereClause}
      GROUP BY pt.ticket_id
      ORDER BY pt.issue_date DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const [tickets] = await pool.query(dataQuery, params);

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: tickets.map(t => ({
        ticket_id: t.ticket_id,
        receipt_no: t.receipt_no,
        customer_name: t.customer_name,
        customer_nic: t.customer_nic,
        issue_date: t.issue_date,
        due_date: t.due_date,
        loan_amount: parseFloat(t.loan_amount),
        status: t.status,
        articles_count: t.articles_count
      }))
    };
  }

  /**
   * SEARCH PAWN TICKETS
   * @param {boolean} options.reversibleOnly - If true, only return tickets issued today (for reverse pawning)
   */
  async searchTickets(branchId, searchTerm, options = {}) {
    if (!searchTerm || searchTerm.length < 2) {
      throw new Error('Search term must be at least 2 characters');
    }

    let extraWhere = '';
    const params = [branchId];
    if (options.reversibleOnly) {
      extraWhere = ' AND pt.issue_date = CURDATE() AND pt.status IN (\'ACTIVE\', \'RENEWED\', \'OVERDUE\')';
    } else {
      extraWhere = ' AND pt.status != \'REVERSED\'';
    }

    const query = `
      SELECT 
        pt.ticket_id, pt.receipt_no, pt.branch_id, pt.customer_id,
        pt.issue_date, pt.due_date, pt.loan_amount, pt.status,
        u.full_name as customer_name, u.nic as customer_nic,
        COUNT(ga.article_id) as articles_count
      FROM pawn_tickets pt
      INNER JOIN customer_profiles cp ON pt.customer_id = cp.customer_id
      INNER JOIN users u ON cp.customer_id = u.user_id
      LEFT JOIN gold_articles ga ON pt.ticket_id = ga.ticket_id
      WHERE pt.branch_id = ?
        AND (pt.receipt_no LIKE ? OR u.full_name LIKE ? OR u.nic LIKE ?)
        ${extraWhere}
      GROUP BY pt.ticket_id
      ORDER BY pt.issue_date DESC
      LIMIT 10
    `;

    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern, searchPattern);
    const [tickets] = await pool.query(query, params);

    return tickets.map(t => ({
      ticket_id: t.ticket_id,
      receipt_no: t.receipt_no,
      customer_name: t.customer_name,
      customer_nic: t.customer_nic,
      issue_date: t.issue_date,
      due_date: t.due_date,
      loan_amount: parseFloat(t.loan_amount),
      status: t.status,
      articles_count: t.articles_count
    }));
  }
}

module.exports = new PawnTicketsService();
