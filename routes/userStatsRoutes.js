const express = require('express');
const { 
  getMyStats, 
  getWeeklyLeaderboard, 
  getMyHistory 
} = require('../controllers/userStatsController');
const { requireClerkAuth } = require('../middleware/clerkAuth');

const router = express.Router();

// Logged-in user's current stats
router.get('/me', requireClerkAuth, getMyStats);

// Global top 10 weekly leaderboard
router.get('/weekly', getWeeklyLeaderboard);

// Logged-in user's archived weekly history
router.get('/history', requireClerkAuth, getMyHistory);

module.exports = router;