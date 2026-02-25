/**
 * Staff appointments service
 * List appointments for staff/managers and update status (approve/complete/cancel)
 */

const { pool } = require('../../config/database');

/**
 * Format time value (TIME type from MySQL) to HH:MM
 */
function formatTime(t) {
  if (!t) return '—';
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

/**
 * List appointments for staff with filters
 * STAFF: sees only their branch; MANAGER: can see all or filter by branch
 */
async function listStaffAppointments({ branchId, date, status, page = 1, limit = 50 }, staffContext) {
  const { user_id, branch_id: staffBranchId, roles = [] } = staffContext;
  const isManager = roles.includes('MANAGER');

  const conditions = [];
  const params = [];

  // Branch filter: STAFF sees only their branch; MANAGER can filter or see all
  if (branchId) {
    conditions.push('a.branch_id = ?');
    params.push(branchId);
  } else if (!isManager && staffBranchId) {
    conditions.push('a.branch_id = ?');
    params.push(staffBranchId);
  }

  if (date) {
    conditions.push('a.appointment_date = ?');
    params.push(date);
  }

  if (status && status !== 'all' && status !== '') {
    const s = status.toUpperCase();
    if (s === 'BOOKED') {
      conditions.push("a.status IN ('PENDING','APPROVED')");
    } else {
      conditions.push('a.status = ?');
      params.push(s);
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) as total
    FROM appointments a
    JOIN pawn_tickets pt ON a.ticket_id = pt.ticket_id
    JOIN branches b ON a.branch_id = b.branch_id
    JOIN customer_profiles c ON c.customer_id = a.customer_id
    JOIN users u ON u.user_id = c.customer_id
    ${whereClause}
  `;

  const [countRows] = await pool.query(countQuery, params);
  const total = countRows[0]?.total || 0;

  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const listQuery = `
    SELECT 
      a.appointment_id,
      a.branch_id,
      b.branch_name,
      b.branch_code,
      a.customer_id,
      u.full_name as customer_name,
      c.phone,
      pt.receipt_no,
      a.purpose,
      a.appointment_date,
      a.status,
      a.created_at,
      ts.slot_start as slot_start,
      ts.slot_end as slot_end
    FROM appointments a
    JOIN pawn_tickets pt ON a.ticket_id = pt.ticket_id
    JOIN branches b ON a.branch_id = b.branch_id
    JOIN customer_profiles c ON c.customer_id = a.customer_id
    JOIN users u ON u.user_id = c.customer_id
    LEFT JOIN time_slots ts ON a.slot_id = ts.slot_id
    ${whereClause}
    ORDER BY a.appointment_date ASC, ts.slot_start ASC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(listQuery, params);

  const data = rows.map((r) => {
    const start = r.slot_start;
    const end = r.slot_end;
    const timeSlot = start && end
      ? `${formatTime(start)}-${formatTime(end)}`
      : '—';

    return {
      appointment_id: r.appointment_id,
      branch_id: r.branch_id,
      branch_name: r.branch_name,
      receipt_no: r.receipt_no,
      customer_name: r.customer_name,
      phone: r.phone || '—',
      purpose: r.purpose,
      appointment_date: r.appointment_date,
      time_slot: timeSlot,
      status: r.status,
      created_at: r.created_at,
    };
  });

  return {
    data,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update appointment status (APPROVE, COMPLETE, CANCEL) and log action
 */
async function updateAppointmentStatus(appointmentId, { action, note }, staffId) {
  const validActions = ['COMPLETE', 'CANCEL'];
  if (!validActions.includes(action)) {
    throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
  }

  const conn = await pool.getConnection();
  try {
    const [appts] = await conn.query(
      'SELECT appointment_id, status FROM appointments WHERE appointment_id = ?',
      [appointmentId]
    );
    if (appts.length === 0) {
      throw new Error('Appointment not found');
    }

    const currentStatus = appts[0].status;

    // Validate state transitions (no approval step - PENDING/APPROVED can both go to COMPLETE or CANCEL)
    const validTransitions = {
      PENDING: ['COMPLETE', 'CANCEL'],
      APPROVED: ['COMPLETE', 'CANCEL'],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    const newStatusMap = {
      COMPLETE: 'COMPLETED',
      CANCEL: 'CANCELLED',
    };

    if (!allowed.includes(action)) {
      throw new Error(
        `Cannot ${action} appointment with status ${currentStatus}. ` +
        `Allowed: ${allowed.join(', ') || 'none'}`
      );
    }

    const newStatus = newStatusMap[action];

    await conn.query(
      'UPDATE appointments SET status = ? WHERE appointment_id = ?',
      [newStatus, appointmentId]
    );

    await conn.query(
      `INSERT INTO appointment_actions (appointment_id, action_by_staff_id, action_type, note)
       VALUES (?, ?, ?, ?)`,
      [appointmentId, staffId, action, note || null]
    );

    // Return updated appointment
    const [updated] = await conn.query(
      `SELECT a.appointment_id, a.branch_id, b.branch_name, pt.receipt_no,
              u.full_name as customer_name, c.phone, a.purpose, a.appointment_date,
              a.status, ts.slot_start, ts.slot_end
       FROM appointments a
       JOIN pawn_tickets pt ON a.ticket_id = pt.ticket_id
       JOIN branches b ON a.branch_id = b.branch_id
       JOIN customer_profiles c ON c.customer_id = a.customer_id
       JOIN users u ON u.user_id = c.customer_id
       LEFT JOIN time_slots ts ON a.slot_id = ts.slot_id
       WHERE a.appointment_id = ?`,
      [appointmentId]
    );

    const r = updated[0];
    if (!r) throw new Error('Failed to fetch updated appointment');

    const start = r.slot_start;
    const end = r.slot_end;
    const timeSlot = start && end ? `${formatTime(start)}-${formatTime(end)}` : '—';

    return {
      appointment_id: r.appointment_id,
      branch_id: r.branch_id,
      branch_name: r.branch_name,
      receipt_no: r.receipt_no,
      customer_name: r.customer_name,
      phone: r.phone || '—',
      purpose: r.purpose,
      appointment_date: r.appointment_date,
      time_slot: timeSlot,
      status: r.status,
    };
  } finally {
    conn.release();
  }
}

/**
 * Get active branches for filter dropdown (staff/managers)
 */
async function getBranchesForFilter() {
  const [rows] = await pool.query(
    `SELECT branch_id, branch_name, branch_code FROM branches 
     WHERE status = 'ACTIVE' ORDER BY branch_name`
  );
  return rows;
}

module.exports = {
  listStaffAppointments,
  updateAppointmentStatus,
  getBranchesForFilter,
};
