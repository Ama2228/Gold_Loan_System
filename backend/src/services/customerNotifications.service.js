/**
 * Customer notifications - aggregates reminders, payments, appointment updates
 */

const { pool } = require('../../config/database');

async function getCustomerNotifications(customerId) {
  const notifications = [];

  const [reminders] = await pool.query(
    `SELECT 
      sms.sms_id,
      pt.receipt_no,
      sms.reminder_level,
      sms.scheduled_at,
      sms.sent_at,
      sms.status as sms_status,
      pt.due_date
     FROM sms_reminder_logs sms
     JOIN pawn_tickets pt ON sms.ticket_id = pt.ticket_id
     WHERE sms.customer_id = ?
     ORDER BY sms.scheduled_at DESC
     LIMIT 20`,
    [customerId]
  );

  reminders.forEach(r => {
    const createdAt = r.sent_at || r.scheduled_at;
    const levelLabel = r.reminder_level === 1 ? '1st' : r.reminder_level === 2 ? '2nd' : '3rd';
    notifications.push({
      id: `rem-${r.sms_id}`,
      type: 'REMINDER',
      title: `${levelLabel} Due Date Reminder`,
      message: `Your receipt ${r.receipt_no} is due on ${r.due_date}. Please arrange to renew or redeem soon.`,
      createdAt,
      receiptNo: r.receipt_no,
      meta: { dueDate: r.due_date, reminderLevel: r.reminder_level },
      isRead: false
    });
  });

  const [payments] = await pool.query(
    `SELECT 
      p.payment_id,
      pt.receipt_no,
      p.payment_date,
      p.payment_type,
      p.amount,
      p.payment_method
     FROM payments p
     JOIN pawn_tickets pt ON p.ticket_id = pt.ticket_id
     WHERE pt.customer_id = ?
     ORDER BY p.payment_date DESC
     LIMIT 15`,
    [customerId]
  );

  payments.forEach(p => {
    const typeLabel = p.payment_type === 'PART' ? 'Part payment' : p.payment_type === 'INTEREST' ? 'Interest payment' : 'Full redemption';
    notifications.push({
      id: `pay-${p.payment_id}`,
      type: 'PAYMENT',
      title: 'Payment Received',
      message: `We received your ${typeLabel} of Rs. ${parseFloat(p.amount).toLocaleString()} for receipt ${p.receipt_no}.`,
      createdAt: p.payment_date,
      receiptNo: p.receipt_no,
      meta: { paymentAmount: parseFloat(p.amount), paymentMethod: p.payment_method, paymentType: p.payment_type },
      isRead: false
    });
  });

  const [apptActions] = await pool.query(
    `SELECT 
      aa.action_id,
      a.appointment_id,
      pt.receipt_no,
      aa.action_type,
      aa.action_time,
      a.appointment_date
     FROM appointment_actions aa
     JOIN appointments a ON aa.appointment_id = a.appointment_id
     JOIN pawn_tickets pt ON a.ticket_id = pt.ticket_id
     WHERE a.customer_id = ?
     ORDER BY aa.action_time DESC
     LIMIT 10`,
    [customerId]
  );

  apptActions.forEach(a => {
    let title = 'Appointment Update';
    let message = '';
    if (a.action_type === 'APPROVE') {
      title = 'Appointment Approved';
      message = `Your appointment for receipt ${a.receipt_no} on ${a.appointment_date} has been approved.`;
    } else if (a.action_type === 'COMPLETE') {
      title = 'Appointment Completed';
      message = `Your appointment for receipt ${a.receipt_no} has been completed.`;
    } else if (a.action_type === 'CANCEL') {
      title = 'Appointment Cancelled';
      message = `Your appointment for receipt ${a.receipt_no} on ${a.appointment_date} has been cancelled.`;
    }
    notifications.push({
      id: `appt-${a.action_id}`,
      type: 'APPOINTMENT',
      title,
      message,
      createdAt: a.action_time,
      receiptNo: a.receipt_no,
      meta: { appointmentDate: a.appointment_date, actionType: a.action_type },
      isRead: false
    });
  });

  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return notifications.slice(0, 30);
}

module.exports = { getCustomerNotifications };
