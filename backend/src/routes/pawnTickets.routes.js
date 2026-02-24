const express = require('express');
const { authenticate: protect } = require('../../middleware/auth');
const { authorize: requireRole } = require('../../middleware/auth');
const pawnTicketsController = require('../controllers/pawnTickets.controller');

/**
 * ========================================
 * PAWN TICKETS ROUTES
 * All staff (STAFF/MANAGER) can view
 * POST restricted to STAFF role
 * ========================================
 */

const router = express.Router();

// Apply protect and STAFF/MANAGER role requirement to all routes
router.use(protect);
router.use(requireRole('STAFF', 'MANAGER'));

// ========== POST - CREATE PAWN TICKET ==========
/**
 * POST /api/v1/staff/pawn-tickets
 * Create a new pawn ticket with gold articles
 * Permission: STAFF, MANAGER
 */
router.post('/', pawnTicketsController.createPawnTicket);

// ========== GET SINGLE TICKET ==========
/**
 * GET /api/v1/staff/pawn-tickets/:ticketId
 * Get pawn ticket details with articles
 * Permission: STAFF, MANAGER
 */
router.get('/:ticketId', pawnTicketsController.getTicketById);

// ========== SEARCH TICKETS ==========
/**
 * GET /api/v1/staff/pawn-tickets/search/:searchTerm
 * Search pawn tickets by receipt number, customer name, or NIC
 * Min 2 characters, returns up to 10 results
 * Permission: STAFF, MANAGER
 * 
 * Note: This must come BEFORE the :ticketId route
 */
router.get('/search/:searchTerm', pawnTicketsController.searchTickets);

// ========== CUSTOMER TICKETS ==========
/**
 * GET /api/v1/staff/pawn-tickets/customer/:customerId
 * Get all tickets for a specific customer
 * Permission: STAFF, MANAGER
 */
router.get('/customer/:customerId', pawnTicketsController.getCustomerTickets);

// ========== TICKETS BY STATUS ==========
/**
 * GET /api/v1/staff/pawn-tickets/status/:status
 * Get tickets by status (ACTIVE, RENEWED, OVERDUE, CLOSED, AUCTION)
 * Permission: STAFF, MANAGER
 */
router.get('/status/:status', pawnTicketsController.getTicketsByStatus);

// ========== LIST TICKETS WITH PAGINATION ==========
/**
 * GET /api/v1/staff/pawn-tickets
 * List pawn tickets with pagination and filters
 * Query params: page, limit, status, customerId
 * Permission: STAFF, MANAGER
 * 
 * Note: This must come AFTER specific routes like /search and /status
 */
router.get('/', pawnTicketsController.listTickets);

module.exports = router;
