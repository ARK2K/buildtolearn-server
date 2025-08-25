const express = require('express');
const { 
  getMyStats, 
  getWeeklyLeaderboard, 
  getMyHistory 
} = require('../controllers/userStatsController');
const { requireClerkAuth } = require('../middleware/clerkAuth');

const router = express.Router();

router.get('/me', requireClerkAuth, getMyStats);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/history', requireClerkAuth, getMyHistory);

module.exports = router;