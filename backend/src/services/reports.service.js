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
      WHERE DATE(t.issue_date) = ? AND t.status != 'REVERSED'
      ${branchWhereClause}
    `;

    const summaryParams = [date, date, ...branchParams];
    const [[summary]] = await pool.query(summaryQuery, summaryParams);

    const dailyCountsQuery = `
      SELECT
        (
          SELECT COUNT(*)
          FROM pawn_tickets t2
          JOIN branches b2 ON t2.branch_id = b2.branch_id
          WHERE DATE(t2.issue_date) = ? AND t2.status != 'REVERSED'
          ${branchWhereClause.replace(/\bb\./g, 'b2.')}
        ) AS pawnings,
        (
          SELECT COUNT(*)
          FROM redeems r2
          JOIN pawn_tickets t3 ON r2.ticket_id = t3.ticket_id
          JOIN branches b3 ON t3.branch_id = b3.branch_id
          WHERE DATE(r2.redeemed_date) = ?
            AND DATE(t3.issue_date) = ?
            AND t3.status != 'REVERSED'
          ${branchWhereClause.replace(/\bb\./g, 'b3.')}
        ) AS redeems,
        (
          SELECT COUNT(*)
          FROM renewals rw2
          JOIN pawn_tickets t4 ON rw2.ticket_id = t4.ticket_id
          JOIN branches b4 ON t4.branch_id = b4.branch_id
          WHERE DATE(rw2.renewal_date) = ?
            AND DATE(t4.issue_date) = ?
            AND t4.status != 'REVERSED'
          ${branchWhereClause.replace(/\bb\./g, 'b4.')}
        ) AS renewals,
        (
          SELECT COUNT(*)
          FROM payments p2
          JOIN pawn_tickets t5 ON p2.ticket_id = t5.ticket_id
          JOIN branches b5 ON t5.branch_id = b5.branch_id
          WHERE DATE(p2.payment_date) = ?
            AND p2.payment_type = 'PART'
            AND DATE(t5.issue_date) = ?
            AND t5.status != 'REVERSED'
          ${branchWhereClause.replace(/\bb\./g, 'b5.')}
        ) AS partPayments
    `;

    const dailyCountsParams = [
      date,
      ...branchParams,
      date,
      date,
      ...branchParams,
      date,
      date,
      ...branchParams,
      date,
      date,
      ...branchParams
    ];

    const [[dailyCounts]] = await pool.query(dailyCountsQuery, dailyCountsParams);

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
      WHERE DATE(t.issue_date) = ? AND t.status != 'REVERSED'
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
          totalInterest: Number(summary.totalInterest),
          transactionCounts: {
            pawnings: Number(dailyCounts?.pawnings || 0),
            redeems: Number(dailyCounts?.redeems || 0),
            renewals: Number(dailyCounts?.renewals || 0),
            partPayments: Number(dailyCounts?.partPayments || 0)
          }
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
      WHERE DATE_FORMAT(t.issue_date, '%Y-%m') = ? AND t.status != 'REVERSED'
      ${branchWhereClause}
    `;

    const summaryParams = [month, month, ...branchParams];
    const [[summary]] = await pool.query(summaryQuery, summaryParams);

    const monthlyCountsQuery = `
      SELECT
        (
          SELECT COUNT(*)
          FROM pawn_tickets t2
          JOIN branches br2 ON t2.branch_id = br2.branch_id
          WHERE DATE_FORMAT(t2.issue_date, '%Y-%m') = ? AND t2.status != 'REVERSED'
          ${branchWhereClause.replace(/\bbr\./g, 'br2.')}
        ) AS pawnings,
        (
          SELECT COUNT(*)
          FROM redeems r2
          JOIN pawn_tickets t3 ON r2.ticket_id = t3.ticket_id
          JOIN branches br3 ON t3.branch_id = br3.branch_id
          WHERE DATE_FORMAT(r2.redeemed_date, '%Y-%m') = ?
            AND DATE_FORMAT(t3.issue_date, '%Y-%m') = ?
            AND t3.status != 'REVERSED'
          ${branchWhereClause.replace(/\bbr\./g, 'br3.')}
        ) AS redeems,
        (
          SELECT COUNT(*)
          FROM renewals rw2
          JOIN pawn_tickets t4 ON rw2.ticket_id = t4.ticket_id
          JOIN branches br4 ON t4.branch_id = br4.branch_id
          WHERE DATE_FORMAT(rw2.renewal_date, '%Y-%m') = ?
            AND DATE_FORMAT(t4.issue_date, '%Y-%m') = ?
            AND t4.status != 'REVERSED'
          ${branchWhereClause.replace(/\bbr\./g, 'br4.')}
        ) AS renewals,
        (
          SELECT COUNT(*)
          FROM payments p2
          JOIN pawn_tickets t5 ON p2.ticket_id = t5.ticket_id
          JOIN branches br5 ON t5.branch_id = br5.branch_id
          WHERE DATE_FORMAT(p2.payment_date, '%Y-%m') = ?
            AND p2.payment_type = 'PART'
            AND DATE_FORMAT(t5.issue_date, '%Y-%m') = ?
            AND t5.status != 'REVERSED'
          ${branchWhereClause.replace(/\bbr\./g, 'br5.')}
        ) AS partPayments
    `;

    const monthlyCountsParams = [
      month,
      ...branchParams,
      month,
      month,
      ...branchParams,
      month,
      month,
      ...branchParams,
      month,
      month,
      ...branchParams
    ];

    const [[monthlyCounts]] = await pool.query(monthlyCountsQuery, monthlyCountsParams);

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
      WHERE DATE_FORMAT(t.issue_date, '%Y-%m') = ? AND t.status != 'REVERSED'
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
      WHERE DATE_FORMAT(t.issue_date, '%Y-%m') = ? AND t.status != 'REVERSED'
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
          overdueCount: Number(summary.overdueCount),
          transactionCounts: {
            pawnings: Number(monthlyCounts?.pawnings || 0),
            redeems: Number(monthlyCounts?.redeems || 0),
            renewals: Number(monthlyCounts?.renewals || 0),
            partPayments: Number(monthlyCounts?.partPayments || 0)
          }
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

const formatDateOnly = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);

const buildReminderMessage = (template, row) => {
  const dueDate = formatDateOnly(row.due_date) || 'N/A';
  const receiptNo = row.receipt_no || 'N/A';

  if (template) {
    return String(template)
      .replace(/\{receipt_no\}/gi, receiptNo)
      .replace(/\{due_date\}/gi, dueDate);
  }

  return `Reminder for receipt ${receiptNo}. Due date: ${dueDate}.`;
};

const getReminderStatus = async (branch = 'ALL', limit = 100) => {
  try {
    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(500, Number(limit))) : 100;

    let branchWhereClause = '';
    const branchParams = [];
    if (branch !== 'ALL') {
      branchWhereClause = 'AND b.branch_code = ?';
      branchParams.push(branch);
    }

    const [summaryRows] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN sms.status = 'SENT' THEN 1 ELSE 0 END), 0) AS sentSuccessfully,
         COALESCE(SUM(CASE WHEN sms.status = 'SENT' THEN 1 ELSE 0 END), 0) AS delivered,
         COALESCE(SUM(CASE WHEN sms.status = 'FAILED' THEN 1 ELSE 0 END), 0) AS failed
       FROM sms_reminder_logs sms
       JOIN branches b ON sms.branch_id = b.branch_id
       WHERE 1=1 ${branchWhereClause}`,
      branchParams
    );

    const [rows] = await pool.query(
      `SELECT
         sms.sms_id,
         sms.ticket_id,
         sms.reminder_level,
         sms.scheduled_at,
         sms.sent_at,
         sms.status,
         sms.provider_response,
         pt.receipt_no,
         pt.due_date,
         rr.message_template,
         u.full_name AS customer_name,
         u.nic,
         cp.email,
         cp.phone
       FROM sms_reminder_logs sms
       JOIN pawn_tickets pt ON sms.ticket_id = pt.ticket_id
       JOIN customer_profiles cp ON sms.customer_id = cp.customer_id
       JOIN users u ON cp.customer_id = u.user_id
       JOIN branches b ON sms.branch_id = b.branch_id
       LEFT JOIN reminder_rules rr ON sms.rule_id = rr.rule_id
       WHERE 1=1 ${branchWhereClause}
       ORDER BY COALESCE(sms.sent_at, sms.scheduled_at) DESC
       LIMIT ${safeLimit}`,
      branchParams
    );

    const summary = summaryRows?.[0] || { sentSuccessfully: 0, delivered: 0, failed: 0 };

    return {
      success: true,
      data: {
        summary: {
          sentSuccessfully: Number(summary.sentSuccessfully || 0),
          delivered: Number(summary.delivered || 0),
          failed: Number(summary.failed || 0)
        },
        reminders: rows.map((row) => ({
          id: Number(row.sms_id),
          ticketId: Number(row.ticket_id),
          receiptNo: row.receipt_no,
          customer: row.customer_name,
          nic: row.nic,
          message: buildReminderMessage(row.message_template, row),
          sentDate: formatDateOnly(row.sent_at || row.scheduled_at),
          status: row.status,
          reminderLevel: Number(row.reminder_level || 0),
          method: row.provider_response?.includes('EMAIL_SENT') ? 'EMAIL + IN_APP' : 'IN_APP',
          email: row.email || null,
          mobileNumber: row.phone || null,
          providerResponse: row.provider_response || null
        }))
      }
    };
  } catch (error) {
    console.error('❌ getReminderStatus error:', error);
    throw error;
  }
};

const sendReminderMessages = async (branch = 'ALL', receiptNo = null) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rules] = await connection.query(
      `SELECT rule_id, reminder_level, days_after_due, message_template
       FROM reminder_rules
       ORDER BY reminder_level`
    );

    if (!rules.length) {
      await connection.commit();
      return {
        success: true,
        data: { generated: 0, processedTickets: 0 }
      };
    }

    const ticketParams = [];
    let ticketWhere = `WHERE pt.status IN ('ACTIVE', 'RENEWED', 'OVERDUE') AND pt.due_date IS NOT NULL`;
    if (branch !== 'ALL') {
      ticketWhere += ' AND b.branch_code = ?';
      ticketParams.push(branch);
    }
    if (receiptNo) {
      ticketWhere += ' AND pt.receipt_no = ?';
      ticketParams.push(receiptNo);
    }

    const [tickets] = await connection.query(
      `SELECT
         pt.ticket_id,
         pt.receipt_no,
         pt.branch_id,
         pt.customer_id,
         pt.status,
         pt.due_date,
         cp.email,
         b.branch_code
       FROM pawn_tickets pt
       JOIN branches b ON pt.branch_id = b.branch_id
       JOIN customer_profiles cp ON pt.customer_id = cp.customer_id
       ${ticketWhere}`,
      ticketParams
    );

    if (!tickets.length) {
      await connection.commit();
      return {
        success: true,
        data: { generated: 0, processedTickets: 0 }
      };
    }

    const ticketIds = tickets.map((t) => t.ticket_id);
    const [existingLogs] = await connection.query(
      `SELECT ticket_id, reminder_level
       FROM sms_reminder_logs
       WHERE ticket_id IN (${ticketIds.map(() => '?').join(',')})
         AND status IN ('SCHEDULED', 'SENT', 'FAILED')`,
      ticketIds
    );

    const existingKeySet = new Set(existingLogs.map((row) => `${row.ticket_id}:${row.reminder_level}`));
    const todayKey = formatDateOnly(new Date());
    const today = new Date(todayKey);

    let generated = 0;

    for (const ticket of tickets) {
      const dueKey = formatDateOnly(ticket.due_date);
      if (!dueKey) continue;

      const dueDate = new Date(dueKey);
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0 && ticket.status !== 'OVERDUE') {
        await connection.query(
          `UPDATE pawn_tickets SET status = 'OVERDUE' WHERE ticket_id = ?`,
          [ticket.ticket_id]
        );
      }

      for (const rule of rules) {
        if (daysOverdue < Number(rule.days_after_due || 0)) continue;

        const key = `${ticket.ticket_id}:${rule.reminder_level}`;
        if (existingKeySet.has(key)) continue;

        const emailStatus = ticket.email ? 'EMAIL_SENT' : 'EMAIL_SKIPPED_NO_ADDRESS';
        const providerResponse = `${emailStatus};IN_APP_SENT;SMS_GATEWAY_PENDING`;

        await connection.query(
          `INSERT INTO sms_reminder_logs
             (ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, sent_at, status, provider_response)
           VALUES (?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL ? DAY), NOW(), 'SENT', ?)`,
          [
            ticket.ticket_id,
            ticket.branch_id,
            ticket.customer_id,
            rule.reminder_level,
            rule.rule_id,
            ticket.due_date,
            rule.days_after_due,
            providerResponse
          ]
        );

        existingKeySet.add(key);
        generated += 1;
      }
    }

    await connection.commit();

    return {
      success: true,
      data: {
        generated,
        processedTickets: tickets.length
      }
    };
  } catch (error) {
    await connection.rollback();
    console.error('❌ sendReminderMessages error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getAuctionReport,
  getReminderStatus,
  sendReminderMessages
};
