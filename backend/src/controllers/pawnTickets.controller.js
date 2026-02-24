const pawnTicketsService = require('../services/pawnTickets.service');

/**
 * ========================================
 * PAWN TICKETS CONTROLLER
 * Request validation & Response handling
 * ========================================
 */

class PawnTicketsController {
  /**
   * POST /api/v1/staff/pawn-tickets
   * Create new pawn ticket
   * 
   * Body:
   * {
   *   customer_id: number,
   *   branch_id: number,
   *   pawning_period_months: number (3/6/12),
   *   interest_percentage: number (optional, default 100),
   *   articles: [
   *     {
   *       item_type: string,
   *       quantity: number,
   *       gross_weight_grams: number,
   *       net_weight_grams: number,
   *       purity_karat: number,
   *       notes: string (optional)
   *     }
   *   ]
   * }
   */
  async createPawnTicket(req, res) {
    try {
      const { customer_id, branch_id, pawning_period_months, interest_percentage, articles } = req.body;

      // Basic validation
      if (!customer_id || !branch_id || !pawning_period_months || !articles) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: customer_id, branch_id, pawning_period_months, articles'
        });
      }

      if (!Array.isArray(articles)) {
        return res.status(400).json({
          success: false,
          message: 'articles must be an array'
        });
      }

      // Validate numeric fields
      if (!Number.isInteger(customer_id) || customer_id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'customer_id must be a positive integer'
        });
      }

      if (!Number.isInteger(branch_id) || branch_id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'branch_id must be a positive integer'
        });
      }

      if (![3, 6, 12].includes(pawning_period_months)) {
        return res.status(400).json({
          success: false,
          message: 'pawning_period_months must be 3, 6, or 12'
        });
      }

      if (interest_percentage && (interest_percentage <= 0 || interest_percentage > 200)) {
        return res.status(400).json({
          success: false,
          message: 'interest_percentage must be between 0.01 and 200'
        });
      }

      // Create ticket
      const result = await pawnTicketsService.createPawnTicket(
        {
          customer_id,
          branch_id,
          pawning_period_months,
          interest_percentage: interest_percentage || 100,
          articles
        },
        {
          user_id: req.user.user_id,
          roles: req.user.roles,
          branch_id: req.user.branch_id
        }
      );

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Pawn ticket created successfully'
      });

    } catch (error) {
      console.error('Create pawn ticket error:', error);

      // Specific error messages
      if (error.message.includes('Customer')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Branch')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Staff')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('minimum')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Article')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to create pawn ticket',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/staff/pawn-tickets/:ticketId
   * Get pawn ticket details with articles
   */
  async getTicketById(req, res) {
    try {
      const { ticketId } = req.params;

      if (!ticketId || !Number.isInteger(parseInt(ticketId)) || parseInt(ticketId) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      const ticket = await pawnTicketsService.getTicketById(ticketId);

      return res.status(200).json({
        success: true,
        data: ticket,
        message: 'Ticket details retrieved'
      });

    } catch (error) {
      console.error('Get ticket error:', error);

      if (error.message === 'Ticket not found') {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to get ticket',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/staff/pawn-tickets
   * List pawn tickets with pagination and filters
   * 
   * Query params:
   * - page: number (default: 1)
   * - limit: number (default: 10)
   * - status: string (ACTIVE|RENEWED|OVERDUE|CLOSED|AUCTION)
   * - customerId: number (optional)
   */
  async listTickets(req, res) {
    try {
      const { page = 1, limit = 10, status, customerId } = req.query;
      const branchId = req.user.branch_id;

      // Validate pagination
      if (!Number.isInteger(parseInt(page)) || parseInt(page) < 1) {
        return res.status(400).json({
          success: false,
          message: 'page must be a positive integer'
        });
      }

      if (!Number.isInteger(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100) {
        return res.status(400).json({
          success: false,
          message: 'limit must be between 1 and 100'
        });
      }

      const result = await pawnTicketsService.getTickets(branchId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status: status || null,
        customerId: customerId ? parseInt(customerId) : null
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Tickets list retrieved'
      });

    } catch (error) {
      console.error('List tickets error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to list tickets',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/staff/pawn-tickets/search/:searchTerm
   * Search pawn tickets
   */
  async searchTickets(req, res) {
    try {
      const { searchTerm } = req.params;
      const branchId = req.user.branch_id;

      if (!searchTerm || searchTerm.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters'
        });
      }

      const tickets = await pawnTicketsService.searchTickets(branchId, searchTerm);

      return res.status(200).json({
        success: true,
        data: {
          total: tickets.length,
          tickets: tickets
        },
        message: 'Search completed'
      });

    } catch (error) {
      console.error('Search tickets error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to search tickets',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/staff/pawn-tickets/customer/:customerId
   * Get all tickets for a specific customer
   */
  async getCustomerTickets(req, res) {
    try {
      const { customerId } = req.params;
      const branchId = req.user.branch_id;

      if (!customerId || !Number.isInteger(parseInt(customerId)) || parseInt(customerId) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer ID'
        });
      }

      const result = await pawnTicketsService.getTickets(branchId, {
        page: 1,
        limit: 50,
        customerId: parseInt(customerId)
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Customer tickets retrieved'
      });

    } catch (error) {
      console.error('Get customer tickets error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to get customer tickets',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/staff/pawn-tickets/status/ACTIVE
   * Get tickets by status (for dashboard/reports)
   */
  async getTicketsByStatus(req, res) {
    try {
      const { status } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const branchId = req.user.branch_id;

      const validStatuses = ['ACTIVE', 'RENEWED', 'OVERDUE', 'CLOSED', 'AUCTION'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const result = await pawnTicketsService.getTickets(branchId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status: status.toUpperCase()
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: `${status} tickets retrieved`
      });

    } catch (error) {
      console.error('Get tickets by status error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to get tickets by status',
        error: error.message
      });
    }
  }
}

module.exports = new PawnTicketsController();
