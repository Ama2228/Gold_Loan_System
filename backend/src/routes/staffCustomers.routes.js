const express = require('express');
const { authenticate: protect } = require('../../middleware/auth');
const { authorize: requireRole } = require('../../middleware/auth');
const {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getOccupations,
  getCities,
  getDistricts
} = require('../controllers/staffCustomers.controller');

const router = express.Router();

// Apply protect and STAFF/MANAGER role requirement to all routes
router.use(protect);
router.use(requireRole('STAFF', 'MANAGER'));

// @route   POST /api/v1/staff/customers
// @desc    Create a new customer
// @access  Private/Staff/Manager
router.post('/', createCustomer);

// @route   GET /api/v1/staff/customers/meta/occupations
// @desc    Get all occupations
// @access  Private/Staff/Manager
router.get('/meta/occupations', getOccupations);

// @route   GET /api/v1/staff/customers/meta/cities
// @desc    Get all cities
// @access  Private/Staff/Manager
router.get('/meta/cities', getCities);

// @route   GET /api/v1/staff/customers/meta/districts
// @desc    Get all districts
// @access  Private/Staff/Manager
router.get('/meta/districts', getDistricts);

// @route   GET /api/v1/staff/customers/search
// @desc    Search customers by query (using query param or path param)
// @access  Private/Staff/Manager
router.get('/search', searchCustomers);
router.get('/search/:query', searchCustomers);

// @route   GET /api/v1/staff/customers/:customerId
// @desc    Get customer by ID
// @access  Private/Staff/Manager
router.get('/:customerId', getCustomerById);

// @route   PUT /api/v1/staff/customers/:customerId
// @desc    Update customer
// @access  Private/Staff/Manager
router.put('/:customerId', updateCustomer);

// @route   DELETE /api/v1/staff/customers/:customerId
// @desc    Delete customer (soft delete)
// @access  Private/Staff/Manager
router.delete('/:customerId', deleteCustomer);

// @route   GET /api/v1/staff/customers
// @desc    List all customers with pagination
// @access  Private/Staff/Manager
router.get('/', listCustomers);

module.exports = router;
