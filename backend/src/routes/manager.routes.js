const express = require('express');
const { authenticate: protect } = require('../../middleware/auth');
const { authorize: requireRole } = require('../../middleware/auth');
const {
  getDashboard,
  getReversePawningList,
  createReversePawning
} = require('../controllers/manager.controller');

const router = express.Router();

router.use(protect);
router.use(requireRole('MANAGER'));

router.get('/dashboard', getDashboard);
router.get('/reverse-pawning', getReversePawningList);
router.post('/reverse-pawning', createReversePawning);

module.exports = router;
