const { pool } = require('../../config/database');

// @desc    Get daily report
// @param   date - Report date (YYYY-MM-DD)
// @param   branch - Optional branch code or 'ALL'
// @returns Summary stats and transaction list
const getDailyReport = async (date, branch = 'ALL') => {
  try {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      };
    }

    // Build WHERE clause for branch
    let branchWhereClause = '';
    let branchParams = [];
    if (branch !== 'ALL') {
      branchWhereClause = `AND b.branch_code = ?`;
      branchParams = [branch];
    }

    // Get summary stats
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT t.ticket_id) as totalTickets,
        COALESCE(SUM(t.loan_amount), 0) as totalLoanIssued,
        COALESCE(SUM(p.amount), 0) as totalPayments,
        COALESCE(SUM(CASE WHEN p.payment_type = 'INTEREST' THEN p.amount ELSE 0 END), 0) as totalInterest
      FROM pawn_tickets t
      JOIN branches b ON t.branch_id = b.branch_id
      LEFT JOIN payments p ON t.ticket_id = p.ticket_id AND DATE(p.payment_date) = ?
      WHERE DATE(t.issue_date) = ?
      ${branchWhereClause}
    `;

    const summaryParams = [date, date, ...branchParams];
    const [[summary]] = await pool.query(summaryQuery, summaryParams);

    // Get transaction details
    const dataQuery = `
      SELECT 
        t.receipt_no,
        u.full_name as customerName,
        t.loan_amount,
        COALESCE(SUM(CASE WHEN p.payment_type = 'INTEREST' THEN p.amount ELSE 0 END), 0) as interestPaid,
        COALESCE(GROUP_CONCAT(DISTINCT p.payment_type SEPARATOR '/'), 'NONE') as paymentType,
        t.status,
        b.branch_code as branch
      FROM pawn_tickets t
      JOIN customer_profiles c ON t.customer_id = c.customer_id
      JOIN users u ON c.customer_id = u.user_id
      JOIN branches b ON t.branch_id = b.branch_id
      LEFT JOIN payments p ON t.ticket_id = p.ticket_id AND DATE(p.payment_date) = ?
      WHERE DATE(t.issue_date) = ?
      ${branchWhereClause}
      GROUP BY t.ticket_id, t.receipt_no, u.full_name, t.loan_amount, t.status, b.branch_code
      ORDER BY t.receipt_no
    `;

    const dataParams = [date, date, ...branchParams];
    const [data] = await pool.query(dataQuery, dataParams);

    return {
      success: true,
      data: {
        summary: {
          totalTickets: Number(summary.totalTickets),
          totalLoanIssued: Number(summary.totalLoanIssued),
          totalPayments: Number(summary.totalPayments),
          totalInterest: Number(summary.totalInterest)
        },
        data: data.map(row => ({
          ...row,
          loanAmount: Number(row.loan_amount),
          interestPaid: Number(row.interestPaid)
        }))
      }
    };
  } catch (error) {
    console.error('❌ getDailyReport error:', error);
    throw error;
  }
};

// @desc    Get monthly report
// @param   month - Report month (YYYY-MM)
// @param   branch - Optional branch code
// @returns Monthly summary, branch breakdown, and transaction list
const getMonthlyReport = async (month, branch = 'ALL') => {
  try {
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return {
        success: false,
        message: 'Invalid month format. Use YYYY-MM'
      };
    }

    // Build WHERE clause
    let branchWhereClause = '';
    let branchParams = [];
    if (branch !== 'ALL') {
      branchWhereClause = `AND br.branch_code = ?`;
      branchParams = [branch];
    }

    // Get summary stats
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT t.ticket_id) as totalTickets,
        COALESCE(SUM(t.loan_amount), 0) as totalLoanIssued,
        COALESCE(SUM(CASE WHEN p.payment_type IN ('PART', 'INTEREST', 'FULL') THEN p.amount ELSE 0 END), 0) as totalPayments,
        COALESCE(SUM(CASE WHEN p.payment_type = 'INTEREST' THEN p.amount ELSE 0 END), 0) as totalInterest,
        COALESCE(SUM(CASE WHEN r.redeem_id IS NOT NULL THEN 1 ELSE 0 END), 0) as redeemedCount,
        COALESCE(SUM(CASE WHEN t.status = 'OVERDUE' THEN 1 ELSE 0 END), 0) as overdueCount
      FROM pawn_tickets t
      JOIN branches br ON t.branch_id = br.branch_id
      LEFT JOIN payments p ON t.ticket_id = p.ticket_id AND DATE_FORMAT(p.payment_date, '%Y-%m') = ?
      LEFT JOIN redeems r ON t.ticket_id = r.ticket_id
      WHERE DATE_FORMAT(t.issue_date, '%Y-%m') = ?
      ${branchWhereClause}
    `;

    const summaryParams = [month, month, ...branchParams];
    const [[summary]] = await pool.query(summaryQuery, summaryParams);

    // Get branch breakdown
    const branchBreakdownQuery = `
      SELECT 
        br.branch_code as branchCode,
        COUNT(DISTINCT t.ticket_id) as ticketsCreated,
        COALESCE(SUM(t.loan_amount), 0) as loanIssued,
        COALESCE(SUM(CASE WHEN p.payment_type IN ('PART', 'INTEREST', 'FULL') THEN p.amount ELSE 0 END), 0) as payments,
        COALESCE(SUM(CASE WHEN p.payment_type = 'INTEREST' THEN p.amount ELSE 0 END), 0) as interest,
        COALESCE(SUM(CASE WHEN t.status = 'OVERDUE' THEN 1 ELSE 0 END), 0) as overdueCount
      FROM pawn_tickets t
      JOIN branches br ON t.branch_id = br.branch_id
      LEFT JOIN payments p ON t.ticket_id = p.ticket_id AND DATE_FORMAT(p.payment_date, '%Y-%m') = ?
      WHERE DATE_FORMAT(t.issue_date, '%Y-%m') = ?
      ${branchWhereClause}
      GROUP BY br.branch_id, br.branch_code
      ORDER BY br.branch_code
    `;

    const breakdownParams = [month, month, ...branchParams];
    const [branchBreakdown] = await pool.query(branchBreakdownQuery, breakdownParams);

    // Get transaction details
    const dataQuery = `
      SELECT 
        t.receipt_no as receiptNo,
        u.full_name as customerName,
        DATE(t.issue_date) as issueDate,
        DATE(t.due_date) as dueDate,
        t.loan_amount as loanAmount,
        COALESCE(SUM(p.amount), 0) as totalPaid,
        t.status,
        br.branch_code as branch
      FROM pawn_tickets t
      JOIN customer_profiles c ON t.customer_id = c.customer_id
      JOIN users u ON c.customer_id = u.user_id
      JOIN branches br ON t.branch_id = br.branch_id
      LEFT JOIN payments p ON t.ticket_id = p.ticket_id
      WHERE DATE_FORMAT(t.issue_date, '%Y-%m') = ?
      ${branchWhereClause}
      GROUP BY t.ticket_id, t.receipt_no, u.full_name, t.issue_date, t.due_date, t.loan_amount, t.status, br.branch_code
      ORDER BY t.receipt_no
    `;

    const dataParams = [month, ...branchParams];
    const [data] = await pool.query(dataQuery, dataParams);

    return {
      success: true,
      data: {
        summary: {
          totalTickets: Number(summary.totalTickets),
          totalLoanIssued: Number(summary.totalLoanIssued),
          totalPayments: Number(summary.totalPayments),
          totalInterest: Number(summary.totalInterest),
          redeemedCount: Number(summary.redeemedCount),
          overdueCount: Number(summary.overdueCount)
        },
        branchBreakdown: branchBreakdown.map(row => ({
          branchCode: row.branchCode,
          ticketsCreated: Number(row.ticketsCreated),
          loanIssued: Number(row.loanIssued),
          payments: Number(row.payments),
          interest: Number(row.interest),
          overdueCount: Number(row.overdueCount)
        })),
        data: data.map(row => ({
          ...row,
          loanAmount: Number(row.loanAmount),
          totalPaid: Number(row.totalPaid)
        }))
      }
    };
  } catch (error) {
    console.error('❌ getMonthlyReport error:', error);
    throw error;
  }
};

// @desc    Get auction report
// @param   branch - Branch code or 'ALL'
// @param   status - ELIGIBLE, AUCTIONED, or PENDING
// @param   overdueDays - Optional minimum days overdue
// @returns Auction candidates list
const getAuctionReport = async (branch = 'ALL', status = 'ALL', overdueDays = 0) => {
  try {
    // Build WHERE clauses
    let branchWhereClause = '';
    let branchParams = [];
    if (branch !== 'ALL') {
      branchWhereClause = `AND t.branch_id = (SELECT branch_id FROM branches WHERE branch_code = ?)`;
      branchParams = [branch];
    }

    let statusWhereClause = '';
    if (status !== 'ALL') {
      statusWhereClause = `AND ac.auction_status = ?`;
      branchParams.push(status);
    }

    let overdueDaysWhereClause = '';
    if (overdueDays > 0) {
      overdueDaysWhereClause = `AND DATEDIFF(CURDATE(), t.due_date) >= ?`;
      branchParams.push(overdueDays);
    }

    // Get summary stats
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT t.ticket_id) as totalOverdue,
        COALESCE(SUM(CASE WHEN ac.auction_status = 'ELIGIBLE' THEN 1 ELSE 0 END), 0) as eligible,
        COALESCE(SUM(CASE WHEN ac.auction_status = 'AUCTIONED' THEN 1 ELSE 0 END), 0) as auctioned,
        COALESCE(SUM(t.loan_amount), 0) as totalEstimatedValue
      FROM pawn_tickets t
      LEFT JOIN auction_cases ac ON t.ticket_id = ac.ticket_id
      WHERE t.status = 'OVERDUE'
      ${branchWhereClause}
      ${statusWhereClause}
      ${overdueDaysWhereClause}
    `;

    const [[summary]] = await pool.query(summaryQuery, branchParams);

    // Get auction candidates
    const dataQuery = `
      SELECT 
        t.receipt_no as receiptNo,
        u.full_name as customerName,
        b.branch_code as branch,
        t.loan_amount as loanAmount,
        COALESCE(SUM(CASE WHEN p.payment_type = 'INTEREST' THEN p.amount ELSE 0 END), 0) as currentInterest,
        DATE(t.due_date) as dueDate,
        DATEDIFF(CURDATE(), t.due_date) as daysOverdue,
        COALESCE(COUNT(DISTINCT sms.sms_id), 0) as reminderLevel,
        COALESCE(ac.auction_status, 'PENDING') as auctionStatus,
        (t.loan_amount + COALESCE(SUM(CASE WHEN p.payment_type = 'INTEREST' THEN p.amount ELSE 0 END), 0)) as estimatedValue
      FROM pawn_tickets t
      JOIN customer_profiles c ON t.customer_id = c.customer_id
      JOIN users u ON c.customer_id = u.user_id
      JOIN branches b ON t.branch_id = b.branch_id
      LEFT JOIN payments p ON t.ticket_id = p.ticket_id
      LEFT JOIN sms_reminder_logs sms ON t.ticket_id = sms.ticket_id
      LEFT JOIN auction_cases ac ON t.ticket_id = ac.ticket_id
      WHERE t.status = 'OVERDUE'
      ${branchWhereClause}
      ${statusWhereClause}
      ${overdueDaysWhereClause}
      GROUP BY t.ticket_id, t.receipt_no, u.full_name, b.branch_code, t.loan_amount, 
               t.due_date, ac.auction_status
      ORDER BY DATEDIFF(CURDATE(), t.due_date) DESC
    `;

    const [data] = await pool.query(dataQuery, branchParams);

    return {
      success: true,
      data: {
        summary: {
          totalOverdue: Number(summary.totalOverdue),
          eligible: Number(summary.eligible),
          auctioned: Number(summary.auctioned),
          totalEstimatedValue: Number(summary.totalEstimatedValue)
        },
        data: data.map(row => ({
          ...row,
          loanAmount: Number(row.loanAmount),
          currentInterest: Number(row.currentInterest),
          daysOverdue: Number(row.daysOverdue),
          reminderLevel: Number(row.reminderLevel),
          estimatedValue: Number(row.estimatedValue)
        }))
      }
    };
  } catch (error) {
    console.error('❌ getAuctionReport error:', error);
    throw error;
  }
};

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getAuctionReport
};
