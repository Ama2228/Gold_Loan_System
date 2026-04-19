/**
 * Customer appointments service
 * List and create appointments for logged-in customer
 */

const { pool } = require('../../config/database');

function extractBranchCodeFromReceipt(receiptNo) {
  const text = String(receiptNo || '');
  const match = text.match(/(\d{4})/);
  return match ? match[1] : '';
}

async function getCustomerAppointments(customerId) {
  const [rows] = await pool.query(
    `SELECT 
      a.appointment_id,
      pt.receipt_no,
      b.branch_name,
      b.branch_code,
      a.appointment_date,
      ts.slot_start as time_slot_start,
      ts.slot_end as time_slot_end,
      a.purpose,
      a.status,
      a.created_at
     FROM appointments a
     JOIN pawn_tickets pt ON a.ticket_id = pt.ticket_id
     JOIN branches b ON a.branch_id = b.branch_id
     LEFT JOIN time_slots ts ON a.slot_id = ts.slot_id
     WHERE a.customer_id = ?
     ORDER BY a.appointment_date DESC, ts.slot_start DESC`,
    [customerId]
  );

  return rows.map(r => ({
    appointment_id: r.appointment_id,
    receipt_no: r.receipt_no,
    branch_name: r.branch_name,
    branch_code: r.branch_code,
    appointment_date: r.appointment_date,
    time_slot_start: r.time_slot_start,
    time_slot_end: r.time_slot_end,
    time_slot: r.time_slot_start && r.time_slot_end ? `${String(r.time_slot_start).slice(0, 5)}-${String(r.time_slot_end).slice(0, 5)}` : '—',
    purpose: r.purpose,
    status: r.status,
    created_at: r.created_at
  }));
}

async function createCustomerAppointment(customerId, { ticket_id, purpose, appointment_date, time_slot_start, time_slot_end }) {
  const conn = await pool.getConnection();
  try {
    const [ticketRows] = await conn.query(
      `SELECT ticket_id, branch_id, receipt_no FROM pawn_tickets 
       WHERE ticket_id = ? AND customer_id = ? AND status IN ('ACTIVE', 'RENEWED', 'OVERDUE')`,
      [ticket_id, customerId]
    );
    if (ticketRows.length === 0) {
      throw new Error('Ticket not found or not eligible for appointment');
    }

    const ticket = ticketRows[0];
    const branch_id = ticket.branch_id;

    const [existingUpcomingRows] = await conn.query(
      `SELECT appointment_id, appointment_date
       FROM appointments
       WHERE customer_id = ?
         AND ticket_id = ?
         AND status IN ('PENDING', 'APPROVED')
         AND appointment_date >= CURDATE()
       ORDER BY appointment_date ASC
       LIMIT 1`,
      [customerId, ticket_id]
    );

    if (existingUpcomingRows.length > 0) {
      throw new Error('An upcoming appointment already exists for this receipt. You can create a new one only after that date passes.');
    }

    if (!['RENEW', 'REDEEM'].includes(purpose)) {
      throw new Error('Purpose must be RENEW or REDEEM');
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const reqDateStr = String(appointment_date).slice(0, 10);
    if (reqDateStr <= todayStr) {
      throw new Error('Appointments cannot be scheduled for today or a past date. Please select tomorrow or later.');
    }

    const reqDate = new Date(`${reqDateStr}T00:00:00`);
    const dayOfWeek = reqDate.getDay(); // 0=Sun, 6=Sat
    if (dayOfWeek === 0) {
      throw new Error('Appointments are not available on Sundays. Please select another day.');
    }

    const [branchRows] = await conn.query(
      'SELECT branch_id, branch_code FROM branches WHERE branch_id = ? AND status = ?',
      [branch_id, 'ACTIVE']
    );
    if (branchRows.length === 0) {
      throw new Error('Branch not found');
    }

    const derivedBranchCode = String(branchRows[0].branch_code || '');
    const receiptPrefix = extractBranchCodeFromReceipt(ticket.receipt_no);
    if (receiptPrefix && derivedBranchCode && receiptPrefix !== derivedBranchCode) {
      throw new Error('Selected receipt does not match its branch code');
    }

    const normalizeTime = (t) => (t && t.length === 5 ? t + ':00' : t || '09:00:00');
    const slotStart = normalizeTime(time_slot_start);
    const slotEnd = normalizeTime(time_slot_end);

    if (dayOfWeek === 6 && slotEnd > '12:00:00') {
      throw new Error('On Saturdays, appointment slots are available only up to 12:00.');
    }

    const [slotRows] = await conn.query(
      'SELECT slot_id, capacity FROM time_slots WHERE slot_start = ? AND slot_end = ? AND is_active = 1 LIMIT 1',
      [slotStart, slotEnd]
    );
    const slotId = slotRows.length > 0 ? slotRows[0].slot_id : 1;
    const capacity = slotRows.length > 0 ? (slotRows[0].capacity || 5) : 5;

    const [countRows] = await conn.query(
      `SELECT COUNT(*) as cnt FROM appointments 
       WHERE branch_id = ? AND appointment_date = ? AND slot_id = ? 
         AND status IN ('PENDING', 'APPROVED')`,
      [branch_id, appointment_date, slotId]
    );
    const used = countRows[0]?.cnt || 0;
    if (used >= capacity) {
      throw new Error(
        `This time slot is full (${used}/${capacity} appointments). Please choose another slot.`
      );
    }

    const [result] = await conn.query(
      `INSERT INTO appointments (branch_id, customer_id, ticket_id, purpose, appointment_date, slot_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'APPROVED')`,
      [branch_id, customerId, ticket_id, purpose, appointment_date, slotId]
    );

    return {
      success: true,
      appointment_id: result.insertId,
      message: 'Appointment created successfully'
    };
  } finally {
    conn.release();
  }
}

async function cancelCustomerAppointment(customerId, appointmentId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT appointment_id, customer_id, status, appointment_date
       FROM appointments
       WHERE appointment_id = ? AND customer_id = ?
       LIMIT 1`,
      [appointmentId, customerId]
    );

    if (rows.length === 0) {
      throw new Error('Appointment not found');
    }

    const appointment = rows[0];

    if (!['PENDING', 'APPROVED'].includes(appointment.status)) {
      throw new Error('Only booked appointments can be cancelled');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(String(appointment.appointment_date).slice(0, 10) + 'T00:00:00');

    // Customer can cancel only until day before appointment date.
    if (apptDate <= today) {
      throw new Error('Appointment can only be cancelled until the day before the appointment date');
    }

    await conn.query(
      `UPDATE appointments
       SET status = 'CANCELLED'
       WHERE appointment_id = ?`,
      [appointmentId]
    );

    return {
      success: true,
      appointment_id: appointmentId,
      message: 'Appointment cancelled successfully'
    };
  } finally {
    conn.release();
  }
}

async function getBranches() {
  const [rows] = await pool.query(
    `SELECT branch_id, branch_name, branch_code FROM branches WHERE status = 'ACTIVE' ORDER BY branch_name`
  );
  return rows;
}

/**
 * Get slot availability for a branch on a given date.
 * Returns each time slot with capacity (from time_slots) and used count (appointments PENDING/APPROVED).
 */
async function getSlotAvailability(branchId, date) {
  const dateStr = String(date || '').slice(0, 10);
  const reqDate = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = reqDate.getDay(); // 0=Sun, 6=Sat

  if (dayOfWeek === 0) {
    return [];
  }

  const [rows] = await pool.query(
    `SELECT 
      ts.slot_id,
      ts.slot_start,
      ts.slot_end,
      ts.capacity,
      COALESCE(apt.used_count, 0) as used
    FROM time_slots ts
    LEFT JOIN (
      SELECT slot_id, COUNT(*) as used_count
      FROM appointments
      WHERE branch_id = ? AND appointment_date = ? 
        AND status IN ('PENDING', 'APPROVED')
      GROUP BY slot_id
    ) apt ON ts.slot_id = apt.slot_id
    WHERE ts.is_active = 1
    ORDER BY ts.slot_start`,
    [branchId, date]
  );

  const filteredRows = dayOfWeek === 6
    ? rows.filter((r) => String(r.slot_end || '').slice(0, 8) <= '12:00:00')
    : rows;

  return filteredRows.map((r) => ({
    slot_id: r.slot_id,
    slot_start: String(r.slot_start || '').slice(0, 5),
    slot_end: String(r.slot_end || '').slice(0, 5),
    key: `${String(r.slot_start || '').slice(0, 5)}-${String(r.slot_end || '').slice(0, 5)}`,
    capacity: r.capacity || 5,
    used: parseInt(r.used, 10) || 0,
  }));
}

module.exports = {
  getCustomerAppointments,
  createCustomerAppointment,
  cancelCustomerAppointment,
  getBranches,
  getSlotAvailability
};
