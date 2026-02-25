/**
 * ========================================
 * PAYMENTS CONTROLLER
 * Part payment, Renewal, Redemption
 * ========================================
 */

const paymentsService = require('../services/payments.service');

class PaymentsController {
  /**
   * POST /api/v1/staff/pawn-tickets/:ticketId/part-payment
   * Process part payment
   */
  async processPartPayment(req, res) {
    try {
      const { ticketId } = req.params;
      const { amount, paymentMethod, note } = req.body;
      const staffId = req.user?.user_id;
      const branchId = req.user?.branch_id;

      if (!staffId || !branchId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: staff context required'
        });
      }

      const tid = parseInt(ticketId, 10);
      if (isNaN(tid) || tid <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      const result = await paymentsService.processPartPayment(
        tid,
        { amount, paymentMethod, note },
        staffId,
        branchId
      );

      return res.status(201).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error) {
      console.error('Part payment error:', error);

      if (error.message?.includes('cannot exceed') || error.message?.includes('greater than 0')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message?.includes('not found') || error.message?.includes('already closed')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to process part payment',
        error: error.message
      });
    }
  }

  /**
   * POST /api/v1/staff/pawn-tickets/:ticketId/renewal
   * Process renewal (interest payment + extend due date)
   */
  async processRenewal(req, res) {
    try {
      const { ticketId } = req.params;
      const { paymentMethod, renewalMonths, note } = req.body;
      const staffId = req.user?.user_id;
      const branchId = req.user?.branch_id;

      if (!staffId || !branchId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: staff context required'
        });
      }

      const tid = parseInt(ticketId, 10);
      if (isNaN(tid) || tid <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      const result = await paymentsService.processRenewal(
        tid,
        { paymentMethod, renewalMonths, note },
        staffId,
        branchId
      );

      return res.status(201).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error) {
      console.error('Renewal error:', error);

      if (error.message?.includes('must be 3, 6, or 12') || error.message?.includes('Invalid payment method') || error.message?.includes('No interest')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message?.includes('not found') || error.message?.includes('already closed')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to process renewal',
        error: error.message
      });
    }
  }

  /**
   * POST /api/v1/staff/pawn-tickets/:ticketId/redemption
   * Process full redemption (close ticket)
   */
  async processRedemption(req, res) {
    try {
      const { ticketId } = req.params;
      const { amount, paymentMethod, note } = req.body;
      const staffId = req.user?.user_id;
      const branchId = req.user?.branch_id;

      if (!staffId || !branchId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: staff context required'
        });
      }

      const tid = parseInt(ticketId, 10);
      if (isNaN(tid) || tid <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      const result = await paymentsService.processRedemption(
        tid,
        { amount, paymentMethod, note },
        staffId,
        branchId
      );

      return res.status(201).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error) {
      console.error('Redemption error:', error);

      if (error.message?.includes('must be at least') || error.message?.includes('greater than 0')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message?.includes('not found') || error.message?.includes('already closed')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to process redemption',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentsController();
