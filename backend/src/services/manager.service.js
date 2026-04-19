const { pool } = require('../../config/database');

function getDateRanges(from, to) {
  const today = new Date();

  const format = (d) => d.toISOString().split('T')[0];

  const end = to ? new Date(to) : today;
  const start = from ? new Date(from) : end;

  const monthStart = new Date(end.getFullYear(), end.getMonth(), 1);
  const nextMonthStart = new Date(end.getFullYear(), end.getMonth() + 1, 1);
  const monthEnd = new Date(nextMonthStart - 1);

  return {
    periodFrom: format(start),
    periodTo: format(end),
    monthFrom: format(monthStart),
    monthTo: format(monthEnd)
  };
}

async function getBranchSummary(branchId, { fromDate, toDate }) {
  const [newLoansRows] = await pool.query(
    `
    SELECT 
      COUNT(*) AS count,
      COALESCE(SUM(loan_amount), 0) AS amount
    FROM pawn_tickets
    WHERE branch_id = ?
      AND issue_date BETWEEN ? AND ?
      AND status != 'REVERSED'
    `,
    [branchId, fromDate, toDate]
  );

  const [activeRows] = await pool.query(
    `
    SELECT 
      COUNT(*) AS count,
      COALESCE(SUM(loan_amount), 0) AS amount
    FROM pawn_tickets
    WHERE branch_id = ?
      AND status IN ('ACTIVE', 'RENEWED', 'OVERDUE')
    `,
    [branchId]
  );

  const [overdueRows] = await pool.query(
    `
    SELECT 
      COUNT(*) AS count,
      COALESCE(SUM(loan_amount), 0) AS amount
    FROM pawn_tickets
    WHERE branch_id = ?
      AND status = 'OVERDUE'
    `,
    [branchId]
  );

  return {
    newLoansCount: newLoansRows[0]?.count || 0,
    newLoansAmount: parseFloat(newLoansRows[0]?.amount || 0),
    activeTicketsCount: activeRows[0]?.count || 0,
    activeLoanAmount: parseFloat(activeRows[0]?.amount || 0),
    overdueTicketsCount: overdueRows[0]?.count || 0,
    overdueLoanAmount: parseFloat(overdueRows[0]?.amount || 0)
  };
}

async function getCollections(branchId, { fromDate, toDate }) {
  const [rows] = await pool.query(
    `
    SELECT 
      payment_type,
      COALESCE(SUM(amount), 0) AS total
    FROM payments p
    INNER JOIN pawn_tickets pt ON p.ticket_id = pt.ticket_id
    WHERE pt.branch_id = ?
      AND p.payment_date BETWEEN ? AND ?
    GROUP BY payment_type
    `,
    [branchId, fromDate, toDate]
  );

  const byType = rows.reduce(
    (acc, r) => {
      const type = r.payment_type;
      const val = parseFloat(r.total || 0);
      if (type === 'INTEREST') acc.renewalAmount += val;
      else if (type === 'PART') acc.partPaymentAmount += val;
      else if (type === 'FULL') acc.redemptionAmount += val;
      else acc.otherAmount += val;
      return acc;
    },
    { renewalAmount: 0, partPaymentAmount: 0, redemptionAmount: 0, otherAmount: 0 }
  );

  return byType;
}

async function getBranchName(branchId) {
  const [branchRows] = await pool.query(
    'SELECT branch_code, branch_name FROM branches WHERE branch_id = ?',
    [branchId]
  );
  if (!branchRows[0]) return '';
  return `${branchRows[0].branch_code} - ${branchRows[0].branch_name}`;
}

async function getBranchTargets(branchId, targetDate) {
  let rows = [];
  try {
    const [result] = await pool.query(
      `
      SELECT pawning_target_amount
      FROM branch_targets
      WHERE branch_id = ?
        AND year = YEAR(?)
        AND month = MONTH(?)
      LIMIT 1
      `,
      [branchId, targetDate, targetDate]
    );
    rows = result;
  } catch (error) {
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      // Optional table in some setups; default to no configured target.
      return { monthlyTarget: 0 };
    }
    throw error;
  }

  const monthlyTarget = rows[0]?.pawning_target_amount
    ? parseFloat(rows[0].pawning_target_amount)
    : 0;

  return { monthlyTarget };
}

async function getBranchRankingForPeriod({ fromDate, toDate }) {
  const [loanRows] = await pool.query(
    `
    SELECT 
      pt.branch_id,
      COALESCE(SUM(pt.loan_amount), 0) AS mtd_amount
    FROM pawn_tickets pt
    WHERE pt.issue_date BETWEEN ? AND ?
      AND pt.status != 'REVERSED'
    GROUP BY pt.branch_id
    `,
    [fromDate, toDate]
  );

  if (loanRows.length === 0) {
    return { leaderboard: [], ranksByBranch: {} };
  }

  const branchIds = loanRows.map(r => r.branch_id);

  let targetRows = [];
  try {
    const [rows] = await pool.query(
      `
      SELECT branch_id, pawning_target_amount
      FROM branch_targets
      WHERE branch_id IN (${branchIds.map(() => '?').join(', ')})
        AND year = YEAR(?)
        AND month = MONTH(?)
      `,
      [...branchIds, toDate, toDate]
    );
    targetRows = rows;
  } catch (error) {
    if (error && error.code !== 'ER_NO_SUCH_TABLE') {
      throw error;
    }
    // Missing branch_targets table: rank by MTD amount with target=0.
  }

  const targetsByBranch = targetRows.reduce((acc, r) => {
    acc[r.branch_id] = parseFloat(r.pawning_target_amount || 0);
    return acc;
  }, {});

  const [branchMeta] = await pool.query(
    `
    SELECT branch_id, branch_name, branch_code
    FROM branches
    WHERE branch_id IN (${branchIds.map(() => '?').join(', ')})
    `,
    branchIds
  );

  const namesByBranch = branchMeta.reduce((acc, r) => {
    acc[r.branch_id] = `${r.branch_code} - ${r.branch_name}`;
    return acc;
  }, {});

  const ranking = loanRows.map(r => {
    const target = targetsByBranch[r.branch_id] || 0;
    const achievementPct = target > 0 ? (parseFloat(r.mtd_amount) / target) * 100 : 0;
    return {
      branchId: r.branch_id,
      branchName: namesByBranch[r.branch_id] || `Branch ${r.branch_id}`,
      mtdAmount: parseFloat(r.mtd_amount),
      targetAmount: target,
      achievementPct: Math.round(achievementPct)
    };
  });

  ranking.sort((a, b) => b.achievementPct - a.achievementPct || b.mtdAmount - a.mtdAmount);

  const ranksByBranch = {};
  ranking.forEach((r, idx) => {
    ranksByBranch[r.branchId] = idx + 1;
  });

  return {
    leaderboard: ranking,
    ranksByBranch
  };
}

async function getDashboardStats(branchId, { from, to }) {
  if (!branchId) {
    return {
      period: null,
      headlineKpis: {
        todayNewLoansCount: 0,
        todayNewLoansAmount: 0,
        mtdNewLoansAmount: 0,
        targetAchievementPct: 0,
        remainingToTarget: 0,
        requiredPerRemainingDay: 0
      },
      portfolio: {
        activeTicketsCount: 0,
        activeLoanAmount: 0,
        overdueTicketsCount: 0,
        overdueLoanAmount: 0
      },
      collections: {
        renewalAmount: 0,
        partPaymentAmount: 0,
        redemptionAmount: 0
      },
      ranking: {
        branchRank: null,
        totalBranches: 0,
        leaderboard: []
      },
      timeSeries: {
        dailyLoans: [],
        dailyCollections: []
      },
      branchName: ''
    };
  }

  const { periodFrom, periodTo, monthFrom, monthTo } = getDateRanges(from, to);
  const branchName = await getBranchName(branchId);

  const dailySummary = await getBranchSummary(branchId, {
    fromDate: periodFrom,
    toDate: periodTo
  });

  const mtdSummary = await getBranchSummary(branchId, {
    fromDate: monthFrom,
    toDate: monthTo
  });

  const collections = await getCollections(branchId, {
    fromDate: periodFrom,
    toDate: periodTo
  });

  const { monthlyTarget } = await getBranchTargets(branchId, periodTo);
  const mtdTargetAmount = monthlyTarget;
  const mtdNewLoansAmount = mtdSummary.newLoansAmount;

  const targetAchievementPct =
    mtdTargetAmount > 0 ? Math.round((mtdNewLoansAmount / mtdTargetAmount) * 100) : 0;

  const remainingToTarget = Math.max(mtdTargetAmount - mtdNewLoansAmount, 0);

  const today = new Date(periodTo);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const remainingDays =
    Math.floor((endOfMonth - today) / (1000 * 60 * 60 * 24)) + 1;
  const requiredPerRemainingDay =
    remainingDays > 0 ? Math.round((remainingToTarget / remainingDays) * 100) / 100 : 0;

  const rankingData = await getBranchRankingForPeriod({
    fromDate: monthFrom,
    toDate: monthTo
  });
  const totalBranches = rankingData.leaderboard.length;
  const branchRank = rankingData.ranksByBranch[branchId] || null;

  const [dailyLoans] = await pool.query(
    `
    SELECT 
      DATE(issue_date) AS date,
      COALESCE(SUM(loan_amount), 0) AS amount
    FROM pawn_tickets
    WHERE branch_id = ?
      AND issue_date BETWEEN ? AND ?
      AND status != 'REVERSED'
    GROUP BY DATE(issue_date)
    ORDER BY DATE(issue_date)
    `,
    [branchId, monthFrom, monthTo]
  );

  const [dailyCollections] = await pool.query(
    `
    SELECT 
      DATE(p.payment_date) AS date,
      COALESCE(SUM(p.amount), 0) AS amount
    FROM payments p
    INNER JOIN pawn_tickets pt ON p.ticket_id = pt.ticket_id
    WHERE pt.branch_id = ?
      AND p.payment_date BETWEEN ? AND ?
    GROUP BY DATE(p.payment_date)
    ORDER BY DATE(p.payment_date)
    `,
    [branchId, monthFrom, monthTo]
  );

  return {
    period: { from: periodFrom, to: periodTo },
    headlineKpis: {
      todayNewLoansCount: dailySummary.newLoansCount,
      todayNewLoansAmount: dailySummary.newLoansAmount,
      mtdNewLoansAmount,
      targetAchievementPct,
      remainingToTarget,
      requiredPerRemainingDay
    },
    portfolio: {
      activeTicketsCount: mtdSummary.activeTicketsCount,
      activeLoanAmount: mtdSummary.activeLoanAmount,
      overdueTicketsCount: mtdSummary.overdueTicketsCount,
      overdueLoanAmount: mtdSummary.overdueLoanAmount
    },
    collections,
    ranking: {
      branchRank,
      totalBranches,
      leaderboard: rankingData.leaderboard.slice(0, 5)
    },
    timeSeries: {
      dailyLoans: dailyLoans.map(r => ({
        date: r.date,
        amount: parseFloat(r.amount || 0)
      })),
      dailyCollections: dailyCollections.map(r => ({
        date: r.date,
        amount: parseFloat(r.amount || 0)
      }))
    },
    branchName
  };
}

module.exports = {
  getDashboardStats
};
