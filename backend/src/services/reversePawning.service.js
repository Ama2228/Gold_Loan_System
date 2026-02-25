const { pool } = require('../../config/database');

/**
 * List reverse pawning records for manager's branch
 * @param {number} branchId - Manager's branch_id
 * @returns {Promise<Array>}
 */
async function listRequests(branchId) {
  if (!branchId) return [];

  const [rows] = await pool.query(
    `SELECT 
       r.reverse_id as id,
       r.ticket_id,
       p.receipt_no,
       u.full_name as customerName,
       r.reason,
       r.status,
       r.request_date as dateTime,
       req.full_name as createdBy
     FROM reverse_pawning_requests r
     JOIN pawn_tickets p ON r.ticket_id = p.ticket_id
     JOIN customer_profiles cp ON p.customer_id = cp.customer_id
     JOIN users u ON cp.customer_id = u.user_id
     JOIN staff_profiles sp ON r.requested_by_staff_id = sp.staff_id
     JOIN users req ON sp.staff_id = req.user_id
     WHERE r.branch_id = ?
     ORDER BY r.request_date DESC`,
    [branchId]
  );

  return rows.map(row => ({
    id: row.id,
    ticketId: row.ticket_id,
    receiptNo: row.receipt_no,
    customerName: row.customerName,
    reason: row.reason,
    status: row.status,
    dateTime: row.dateTime,
    createdBy: row.createdBy
  }));
}

/**
 * Create reverse pawning record - manager performs directly (status APPROVED)
 * Archives the pawn ticket (sets status REVERSED) so it becomes invisible to users.
 * Only allowed on the same calendar day the ticket was issued.
 * @param {number} managerStaffId - Manager's staff_id (user_id)
 * @param {number} branchId - Manager's branch_id
 * @param {Object} params - { receiptNo, reason }
 */
async function createRequest(managerStaffId, branchId, { receiptNo, reason }) {
  const trimmedReceipt = (receiptNo || '').trim();
  const trimmedReason = (reason || '').trim();

  if (!trimmedReceipt) {
    throw new Error('Receipt number is required');
  }
  if (trimmedReason.length < 10) {
    throw new Error('Reason must be at least 10 characters');
  }

  const [tickets] = await pool.query(
    `SELECT t.ticket_id, t.branch_id, t.status, t.issue_date, DATE(t.issue_date) as issue_date_only
     FROM pawn_tickets t 
     WHERE t.receipt_no = ? 
     AND t.status IN ('ACTIVE', 'RENEWED', 'OVERDUE')
     AND DATE(t.issue_date) = CURDATE()`,
    [trimmedReceipt]
  );

  if (tickets.length === 0) {
    const [anyTicket] = await pool.query(
      `SELECT DATE(issue_date) as issue_date_only FROM pawn_tickets WHERE receipt_no = ? LIMIT 1`,
      [trimmedReceipt]
    );
    if (anyTicket.length > 0) {
      const issued = anyTicket[0].issue_date_only ? String(anyTicket[0].issue_date_only) : 'unknown';
      throw new Error('Reverse pawning is only allowed on the same day the ticket was issued. This ticket was issued on ' + issued + '.');
    }
    throw new Error('Receipt not found or ticket is not active');
  }

  const ticket = tickets[0];
  if (Number(ticket.branch_id) !== Number(branchId)) {
    throw new Error('Receipt does not belong to your branch');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO reverse_pawning_requests 
       (ticket_id, branch_id, requested_by_staff_id, reason, status, approved_by_staff_id, approved_date)
       VALUES (?, ?, ?, ?, 'APPROVED', ?, NOW())`,
      [ticket.ticket_id, branchId, managerStaffId, trimmedReason, managerStaffId]
    );

    const oldStatus = ticket.status;
    await connection.query(
      `UPDATE pawn_tickets SET status = 'REVERSED' WHERE ticket_id = ?`,
      [ticket.ticket_id]
    );

    await connection.query(
      `INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by_staff_id, remark)
       VALUES (?, ?, 'REVERSED', ?, 'Reverse pawning - archived')`,
      [ticket.ticket_id, oldStatus, managerStaffId]
    );

    await connection.commit();

    return {
      reverseId: result.insertId,
      ticketId: ticket.ticket_id,
      receiptNo: trimmedReceipt,
      status: 'APPROVED'
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  listRequests,
  createRequest
};
