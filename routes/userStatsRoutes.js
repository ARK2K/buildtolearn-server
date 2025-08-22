const express = require('express');
const { getMyStats, getWeeklyLeaderboard } = require('../controllers/userStatsController');
const { requireAuth } = require('../middleware/clerkAuth');

const router = express.Router();

router.get('/me', requireAuth, getMyStats);
router.get('/weekly', getWeeklyLeaderboard);

module.exports = router;