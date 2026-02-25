const { pool } = require('../../config/database');

/**
 * Get manager dashboard stats for their branch
 * @param {number} branchId - Manager's branch_id
 * @returns {Promise<Object>} Dashboard counts
 */
async function getDashboardStats(branchId) {
  if (!branchId) {
    return {
      activeTickets: 0,
      overdueCount: 0,
      dueTodayCount: 0,
      reversePawningCount: 0,
      branchName: ''
    };
  }

  const [branchRows] = await pool.query(
    'SELECT branch_code, branch_name FROM branches WHERE branch_id = ?',
    [branchId]
  );
  const branchName = branchRows[0]
    ? `${branchRows[0].branch_code} - ${branchRows[0].branch_name}`
    : '';

  const [activeRows] = await pool.query(
    `SELECT COUNT(*) as count FROM pawn_tickets 
     WHERE branch_id = ? AND status IN ('ACTIVE', 'RENEWED')`,
    [branchId]
  );

  const [overdueRows] = await pool.query(
    `SELECT COUNT(*) as count FROM pawn_tickets 
     WHERE branch_id = ? AND status = 'OVERDUE'`,
    [branchId]
  );

  const [dueTodayRows] = await pool.query(
    `SELECT COUNT(*) as count FROM pawn_tickets 
     WHERE branch_id = ? AND due_date = CURDATE() 
     AND status IN ('ACTIVE', 'RENEWED', 'OVERDUE')`,
    [branchId]
  );

  const [reverseRows] = await pool.query(
    `SELECT COUNT(*) as count FROM reverse_pawning_requests 
     WHERE branch_id = ?`,
    [branchId]
  );

  return {
    activeTickets: activeRows[0]?.count || 0,
    overdueCount: overdueRows[0]?.count || 0,
    dueTodayCount: dueTodayRows[0]?.count || 0,
    reversePawningCount: reverseRows[0]?.count || 0,
    branchName
  };
}

module.exports = {
  getDashboardStats
};
