const express = require('express');
const { authenticate: protect } = require('../../middleware/auth');
const { authorize: requireRole } = require('../../middleware/auth');
const {
  getDashboard,
  getReversePawningList,
  createReversePawning,
  approveReversePawning,
  rejectReversePawning
} = require('../controllers/manager.controller');

const router = express.Router();

router.use(protect);
router.use(requireRole('MANAGER'));

router.get('/dashboard', getDashboard);
router.get('/reverse-pawning', getReversePawningList);
router.post('/reverse-pawning', createReversePawning);
router.patch('/reverse-pawning/:reverseId/approve', approveReversePawning);
router.patch('/reverse-pawning/:reverseId/reject', rejectReversePawning);

module.exports = router;
