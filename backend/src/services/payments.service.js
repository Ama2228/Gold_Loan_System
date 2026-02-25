/**
 * ========================================
 * PAYMENTS SERVICE
 * Part, Interest, Full (Redemption) payment processing
 * ========================================
 */

const { pool } = require('../../config/database');

const VALID_PAYMENT_STATUSES = ['ACTIVE', 'RENEWED', 'OVERDUE'];
const VALID_PAYMENT_METHODS = ['CASH', 'CARD', 'ONLINE'];

/**
 * Get ticket payment summary for display and validation
 * @param {number} ticketId
 * @returns {Promise<Object>} { outstandingPrincipal, accruedInterest, totalPayable, loanAmount, annualInterestRate, interestType, issueDate, dueDate, lastRenewalDate, recentPayments }
 */
async function getTicketPaymentSummary(ticketId) {
  const conn = await pool.getConnection();

  try {
    const [ticketRows] = await conn.query(
      `SELECT ticket_id, loan_amount, annual_interest_rate, interest_type, issue_date, due_date
       FROM pawn_tickets
       WHERE ticket_id = ? AND status IN ('ACTIVE', 'RENEWED', 'OVERDUE')`,
      [ticketId]
    );

    if (ticketRows.length === 0) {
      throw new Error('Ticket not found or already closed');
    }

    const ticket = ticketRows[0];
    const loanAmount = parseFloat(ticket.loan_amount);
    const annualRate = parseFloat(ticket.annual_interest_rate);
    const interestType = ticket.interest_type || 'MONTHLY';

    const [partSumRows] = await conn.query(
      `SELECT COALESCE(SUM(amount), 0) as total_part FROM payments WHERE ticket_id = ? AND payment_type = 'PART'`,
      [ticketId]
    );
    const totalPartPaid = parseFloat(partSumRows[0].total_part);
    const outstandingPrincipal = Math.max(0, loanAmount - totalPartPaid);

    let interestFromDate = ticket.issue_date;
    const [lastRenewal] = await conn.query(
      `SELECT new_due_date FROM renewals WHERE ticket_id = ? ORDER BY renewal_date DESC LIMIT 1`,
      [ticketId]
    );
    if (lastRenewal.length > 0) {
      interestFromDate = lastRenewal[0].new_due_date;
    }

    const fromDate = new Date(interestFromDate);
    const toDate = new Date();
    const diffDays = Math.max(0, Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)));
    const diffMonths = diffDays / 30.44;

    let accruedInterest = 0;
    if (interestType === 'DAILY') {
      accruedInterest = outstandingPrincipal * (annualRate / 100) * (diffDays / 365);
    } else {
      accruedInterest = outstandingPrincipal * (annualRate / 100) * (diffMonths / 12);
    }
    accruedInterest = Math.round(accruedInterest * 100) / 100;

    const [overdueRows] = await conn.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'OVERDUE_PENALTY_RATE' LIMIT 1`
    );
    let overduePenalty = 0;
    if (overdueRows.length > 0 && ticket.due_date) {
      const dueDate = new Date(ticket.due_date);
      if (toDate > dueDate) {
        const odDays = Math.floor((toDate - dueDate) / (1000 * 60 * 60 * 24));
        const odRate = parseFloat(overdueRows[0].setting_value) || 0;
        overduePenalty = Math.round(outstandingPrincipal * (odRate / 100) * (odDays / 365) * 100) / 100;
      }
    }

    const totalPayable = Math.round((outstandingPrincipal + accruedInterest + overduePenalty) * 100) / 100;

    const [recentPayments] = await conn.query(
      `SELECT payment_id, payment_date, amount, payment_type, payment_method, note
       FROM payments WHERE ticket_id = ? ORDER BY payment_date DESC LIMIT 10`,
      [ticketId]
    );

    return {
      outstandingPrincipal,
      accruedInterest,
      overduePenalty,
      totalPayable,
      loanAmount,
      annualInterestRate: annualRate,
      interestType,
      issueDate: ticket.issue_date,
      dueDate: ticket.due_date,
      lastRenewalDate: lastRenewal.length > 0 ? lastRenewal[0].new_due_date : null,
      recentPayments: recentPayments.map(p => ({
        payment_id: p.payment_id,
        payment_date: p.payment_date,
        amount: parseFloat(p.amount),
        payment_type: p.payment_type,
        payment_method: p.payment_method,
        note: p.note
      }))
    };
  } finally {
    conn.release();
  }
}

/**
 * Compute renewal interest for a given period
 * @param {number} ticketId
 * @param {number} renewalMonths
 * @returns {Promise<Object>} { interestAmount, newDueDate }
 */
async function computeRenewalInterest(ticketId, renewalMonths) {
  const summary = await getTicketPaymentSummary(ticketId);
  const interest = summary.outstandingPrincipal * (summary.annualInterestRate / 100) * (renewalMonths / 12);
  const interestAmount = Math.round(interest * 100) / 100;

  const dueDate = new Date(summary.dueDate);
  const newDueDate = new Date(dueDate);
  newDueDate.setMonth(newDueDate.getMonth() + renewalMonths);

  return {
    interestAmount,
    newDueDate: newDueDate.toISOString().split('T')[0],
    oldDueDate: summary.dueDate
  };
}

/**
 * Process part payment (reduces principal)
 * @param {number} ticketId
 * @param {Object} payload { amount, paymentMethod, note }
 * @param {number} staffId
 * @param {number} branchId
 * @returns {Promise<Object>}
 */
async function processPartPayment(ticketId, payload, staffId, branchId) {
  const { amount, paymentMethod, note } = payload;

  if (!amount || amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  if (!VALID_PAYMENT_METHODS.includes((paymentMethod || 'CASH').toUpperCase())) {
    throw new Error('Invalid payment method. Use CASH, CARD, or ONLINE');
  }

  const summary = await getTicketPaymentSummary(ticketId);
  const amt = parseFloat(amount);
  if (amt > summary.outstandingPrincipal) {
    throw new Error(`Payment amount cannot exceed outstanding balance (Rs. ${summary.outstandingPrincipal.toFixed(2)})`);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO payments (ticket_id, branch_id, paid_by_type, paid_by_staff_id, received_by_staff_id, amount, payment_method, payment_type, note)
       VALUES (?, ?, 'STAFF', ?, ?, ?, ?, 'PART', ?)`,
      [ticketId, branchId, staffId, staffId, amt, (paymentMethod || 'CASH').toUpperCase(), note || null]
    );

    await conn.commit();

    return {
      success: true,
      payment_id: result.insertId,
      amount: amt,
      payment_type: 'PART',
      message: 'Part payment recorded successfully'
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/**
 * Process renewal (interest payment + extend due date)
 * @param {number} ticketId
 * @param {Object} payload { paymentMethod, renewalMonths, note }
 * @param {number} staffId
 * @param {number} branchId
 * @returns {Promise<Object>}
 */
async function processRenewal(ticketId, payload, staffId, branchId) {
  const { paymentMethod, renewalMonths, note } = payload;

  const months = parseInt(renewalMonths, 10);
  if (![3, 6, 12].includes(months)) {
    throw new Error('Renewal period must be 3, 6, or 12 months');
  }
  if (!VALID_PAYMENT_METHODS.includes((paymentMethod || 'CASH').toUpperCase())) {
    throw new Error('Invalid payment method. Use CASH, CARD, or ONLINE');
  }

  const { interestAmount, newDueDate, oldDueDate } = await computeRenewalInterest(ticketId, months);
  if (interestAmount <= 0) {
    throw new Error('No interest to pay (outstanding principal is zero)');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [paymentResult] = await conn.query(
      `INSERT INTO payments (ticket_id, branch_id, paid_by_type, paid_by_staff_id, received_by_staff_id, amount, payment_method, payment_type, note)
       VALUES (?, ?, 'STAFF', ?, ?, ?, ?, 'INTEREST', ?)`,
      [ticketId, branchId, staffId, staffId, interestAmount, (paymentMethod || 'CASH').toUpperCase(), note || null]
    );
    const paymentId = paymentResult.insertId;

    await conn.query(
      `INSERT INTO renewals (ticket_id, renewed_by_type, renewed_by_staff_id, old_due_date, new_due_date, interest_payment_id)
       VALUES (?, 'STAFF', ?, ?, ?, ?)`,
      [ticketId, staffId, oldDueDate, newDueDate, paymentId]
    );

    await conn.query(
      `UPDATE pawn_tickets SET due_date = ?, status = 'RENEWED' WHERE ticket_id = ?`,
      [newDueDate, ticketId]
    );

    await conn.commit();

    return {
      success: true,
      payment_id: paymentId,
      interest_amount: interestAmount,
      old_due_date: oldDueDate,
      new_due_date: newDueDate,
      message: 'Ticket renewed successfully'
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/**
 * Process full redemption (close ticket)
 * @param {number} ticketId
 * @param {Object} payload { amount, paymentMethod, note }
 * @param {number} staffId
 * @param {number} branchId
 * @returns {Promise<Object>}
 */
async function processRedemption(ticketId, payload, staffId, branchId) {
  const { amount, paymentMethod, note } = payload;

  if (!amount || amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  if (!VALID_PAYMENT_METHODS.includes((paymentMethod || 'CASH').toUpperCase())) {
    throw new Error('Invalid payment method. Use CASH, CARD, or ONLINE');
  }

  const summary = await getTicketPaymentSummary(ticketId);
  const amt = parseFloat(amount);
  if (amt < summary.totalPayable) {
    throw new Error(`Payment amount must be at least Rs. ${summary.totalPayable.toFixed(2)} to redeem`);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [paymentResult] = await conn.query(
      `INSERT INTO payments (ticket_id, branch_id, paid_by_type, paid_by_staff_id, received_by_staff_id, amount, payment_method, payment_type, note)
       VALUES (?, ?, 'STAFF', ?, ?, ?, ?, 'FULL', ?)`,
      [ticketId, branchId, staffId, staffId, amt, (paymentMethod || 'CASH').toUpperCase(), note || null]
    );
    const paymentId = paymentResult.insertId;

    await conn.query(
      `INSERT INTO redeems (ticket_id, redeemed_by_type, redeemed_by_staff_id, final_payment_id)
       VALUES (?, 'STAFF', ?, ?)`,
      [ticketId, staffId, paymentId]
    );

    const closedDate = new Date().toISOString().split('T')[0];
    await conn.query(
      `UPDATE pawn_tickets SET status = 'CLOSED', closed_date = ? WHERE ticket_id = ?`,
      [closedDate, ticketId]
    );

    await conn.commit();

    return {
      success: true,
      payment_id: paymentId,
      amount: amt,
      closed_date: closedDate,
      message: 'Ticket redeemed successfully'
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/**
 * Process part payment (customer-initiated, e.g. online)
 * Validates ticket belongs to customer
 */
async function processPartPaymentForCustomer(ticketId, payload, customerId) {
  const { amount, paymentMethod, note } = payload;

  if (!amount || amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  if (!VALID_PAYMENT_METHODS.includes((paymentMethod || 'ONLINE').toUpperCase())) {
    throw new Error('Invalid payment method. Use CASH, CARD, or ONLINE');
  }

  const conn = await pool.getConnection();

  try {
    const [ticketRows] = await conn.query(
      'SELECT ticket_id, branch_id FROM pawn_tickets WHERE ticket_id = ? AND customer_id = ? AND status IN (\'ACTIVE\', \'RENEWED\', \'OVERDUE\')',
      [ticketId, customerId]
    );

    if (ticketRows.length === 0) {
      throw new Error('Ticket not found or access denied');
    }

    const { branch_id } = ticketRows[0];
    const summary = await getTicketPaymentSummary(ticketId);
    const amt = parseFloat(amount);
    if (amt > summary.outstandingPrincipal) {
      throw new Error(`Payment amount cannot exceed outstanding balance (Rs. ${summary.outstandingPrincipal.toFixed(2)})`);
    }

    const [result] = await conn.query(
      `INSERT INTO payments (ticket_id, branch_id, paid_by_type, paid_by_customer_id, received_by_staff_id, amount, payment_method, payment_type, note)
       VALUES (?, ?, 'CUSTOMER', ?, NULL, ?, ?, 'PART', ?)`,
      [ticketId, branch_id, customerId, amt, (paymentMethod || 'ONLINE').toUpperCase(), note || null]
    );

    return {
      success: true,
      payment_id: result.insertId,
      amount: amt,
      payment_type: 'PART',
      message: 'Part payment recorded successfully'
    };
  } finally {
    conn.release();
  }
}

module.exports = {
  getTicketPaymentSummary,
  computeRenewalInterest,
  processPartPayment,
  processPartPaymentForCustomer,
  processRenewal,
  processRedemption
};
