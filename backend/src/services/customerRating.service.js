const { pool } = require('../../config/database');

/**
 * CUSTOMER RATING SERVICE
 * Computes risk metrics and scores per customer on demand.
 */

class CustomerRatingService {
  /**
   * Load core ticket + payment history for a customer.
   */
  async _getCustomerHistory(customerId) {
    // Basic ticket facts excluding REVERSED
    const [tickets] = await pool.query(
      `
      SELECT
        pt.ticket_id,
        pt.loan_amount,
        pt.issue_date,
        pt.due_date,
        pt.status,
        pt.closed_date
      FROM pawn_tickets pt
      WHERE pt.customer_id = ?
        AND pt.status != 'REVERSED'
      ORDER BY pt.issue_date ASC
      `,
      [customerId]
    );

    // Payments per ticket
    const [payments] = await pool.query(
      `
      SELECT
        p.payment_id,
        p.ticket_id,
        p.amount,
        p.payment_type,
        p.payment_date
      FROM payments p
      INNER JOIN pawn_tickets pt ON p.ticket_id = pt.ticket_id
      WHERE pt.customer_id = ?
      `,
      [customerId]
    );

    return { tickets, payments };
  }

  /**
   * Compute metrics and base score (0–100) from history.
   */
  _computeMetricsAndScore(tickets) {
    const totalTickets = tickets.length;
    const activeTickets = tickets.filter(t =>
      ['ACTIVE', 'OVERDUE', 'RENEWED'].includes(t.status)
    ).length;

    const totalLoanAmount = tickets.reduce(
      (sum, t) => sum + (parseFloat(t.loan_amount) || 0),
      0
    );
    const avgLoanAmount = totalTickets > 0 ? totalLoanAmount / totalTickets : 0;

    // Classify redeem behavior: on-time vs late vs overdue.
    let onTimeRedeems = 0;
    let lateRedeems = 0;
    let everOverdue = 0;
    let maxDaysOverdue = 0;

    const today = new Date();

    tickets.forEach(t => {
      const due = t.due_date ? new Date(t.due_date) : null;
      const closed = t.closed_date ? new Date(t.closed_date) : null;

      if (t.status === 'OVERDUE') {
        everOverdue += 1;
        if (due) {
          const days = Math.floor((today - due) / (1000 * 60 * 60 * 24));
          if (days > maxDaysOverdue) maxDaysOverdue = days;
        }
      }

      if (t.status === 'REDEEMED' && due && closed) {
        const diffDays = Math.floor((closed - due) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
          onTimeRedeems += 1;
        } else {
          lateRedeems += 1;
          everOverdue += 1;
          if (diffDays > maxDaysOverdue) maxDaysOverdue = diffDays;
        }
      }
    });

    const denom = onTimeRedeems + lateRedeems + everOverdue;
    const onTimeRate = denom > 0 ? onTimeRedeems / denom : 1; // default to good if no history
    const overdueRatio = totalTickets > 0 ? everOverdue / totalTickets : 0;

    // Base score
    let score = 50;

    // On-time behavior
    if (onTimeRate >= 0.9) score += 30;
    else if (onTimeRate >= 0.75) score += 15;
    else if (onTimeRate < 0.5) score -= 20;

    // Overdue history
    if (overdueRatio >= 0.3) score -= 20;
    else if (overdueRatio >= 0.15) score -= 10;

    // Experience / volume
    if (totalTickets >= 10) score += 10;
    else if (totalTickets >= 5) score += 5;

    // Clamp 0–100
    score = Math.max(0, Math.min(100, Math.round(score)));

    const metrics = {
      totalTickets,
      activeTickets,
      totalLoanAmount,
      avgLoanAmount,
      onTimeRedeems,
      lateRedeems,
      everOverdue,
      onTimeRate,
      overdueRatio,
      maxDaysOverdue
    };

    return { metrics, score };
  }

  _labelForScore(score) {
    if (score >= 80) return 'Loyal';
    if (score >= 60) return 'Reliable';
    if (score >= 40) return 'Normal';
    if (score >= 20) return 'Caution';
    return 'High Risk';
  }

  _buildExplanation({ metrics, score }) {
    const lines = [];

    if (metrics.totalTickets === 0) {
      lines.push('No previous pawning history on record');
      return lines;
    }

    const onTimePct = Math.round(metrics.onTimeRate * 100);
    const overduePct = Math.round(metrics.overdueRatio * 100);

    if (metrics.onTimeRate >= 0.9) {
      lines.push(`Pays on time for about ${onTimePct}% of tickets`);
    } else if (metrics.onTimeRate >= 0.75) {
      lines.push(`Mostly pays on time (${onTimePct}% on-time rate)`);
    } else if (metrics.onTimeRate < 0.5) {
      lines.push(`Frequently late or overdue (${onTimePct}% on-time rate)`);
    }

    if (metrics.overdueRatio === 0) {
      lines.push('No overdue history so far');
    } else if (metrics.overdueRatio < 0.15) {
      lines.push(`Occasional overdue history (~${overduePct}% of tickets)`);
    } else {
      lines.push(`Significant overdue history (~${overduePct}% of tickets)`);
    }

    if (metrics.totalTickets >= 10) {
      lines.push('Long-running relationship with multiple tickets');
    } else if (metrics.totalTickets >= 5) {
      lines.push('Some pawning history with this branch');
    } else {
      lines.push('Limited pawning history so far');
    }

    return lines;
  }

  /**
   * Public: get rating for existing customer history only.
   */
  async getCustomerRating(customerId) {
    const { tickets } = await this._getCustomerHistory(customerId);

    const { metrics, score } = this._computeMetricsAndScore(tickets);
    const label = this._labelForScore(score);
    const explanation = this._buildExplanation({ metrics, score });

    return {
      score,
      label,
      metrics: {
        totalTickets: metrics.totalTickets,
        activeTickets: metrics.activeTickets,
        onTimeRate: metrics.onTimeRate,
        overdueRatio: metrics.overdueRatio,
        maxDaysOverdue: metrics.maxDaysOverdue,
        avgLoanAmount: metrics.avgLoanAmount,
        totalLoanAmount: metrics.totalLoanAmount
      },
      explanation
    };
  }

  /**
   * Public: rating plus contextual flag for a new requested amount.
   */
  async getCustomerRatingForRequest(customerId, requestedAmount) {
    const base = await this.getCustomerRating(customerId);

    const { tickets } = await this._getCustomerHistory(customerId);
    const amounts = tickets.map(t => parseFloat(t.loan_amount) || 0).filter(v => v > 0);

    let currentRequestRatio = null;
    const explanation = [...(base.explanation || [])];

    if (amounts.length >= 3) {
      // Simple median-like: sort and take middle (or mean of two middles)
      const sorted = amounts.slice().sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

      if (median > 0 && requestedAmount > 0) {
        currentRequestRatio = requestedAmount / median;
        if (currentRequestRatio > 2) {
          explanation.push('Unusually large loan compared to past history');
        }
      }
    }

    return {
      ...base,
      currentRequestRatio,
      explanation
    };
  }
}

module.exports = new CustomerRatingService();

