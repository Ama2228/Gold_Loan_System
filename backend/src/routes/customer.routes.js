const express = require('express');
const router = express.Router();
const customerController = require('../../src/controllers/customer.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// All customer routes require authentication
router.use(authenticate);

// @route   GET /api/v1/customers
// @access  Private (Staff, Manager, Admin)
router.get('/', authorize('STAFF', 'MANAGER', 'ADMIN'), customerController.getAllCustomers);

// @route   GET /api/v1/customers/search/:query
// @access  Private
router.get('/search/:query', customerController.searchCustomers);

// @route   GET /api/v1/customers/:customerId
// @access  Private
router.get('/:customerId', customerController.getCustomerById);

// @route   POST /api/v1/customers
// @access  Private (Staff, Manager, Admin)
router.post('/', authorize('STAFF', 'MANAGER', 'ADMIN'), customerController.createCustomer);

// @route   PUT /api/v1/customers/:customerId
// @access  Private (Staff, Manager, Admin)
router.put('/:customerId', authorize('STAFF', 'MANAGER', 'ADMIN'), customerController.updateCustomer);

// @route   DELETE /api/v1/customers/:customerId
// @access  Private (Manager, Admin)
router.delete('/:customerId', authorize('MANAGER', 'ADMIN'), customerController.deleteCustomer);

module.exports = router;
