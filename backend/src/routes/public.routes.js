const express = require('express');
const { getAnnualInterestRate, getPublicKaratAdvanceRates } = require('../controllers/public.controller');

const router = express.Router();

// @route   GET /annual-interest-rate
// @desc    Public annual interest rate for landing pages
// @access  Public
router.get('/annual-interest-rate', getAnnualInterestRate);
router.get('/karat-advance-rates', getPublicKaratAdvanceRates);

module.exports = router;