const express = require('express');
const { getMyStats, getWeeklyLeaderboard } = require('../controllers/userStatsController');
const { requireClerkAuth } = require('../middleware/clerkAuth');

const router = express.Router();

router.get('/me', requireClerkAuth, getMyStats);
router.get('/weekly', getWeeklyLeaderboard);

module.exports = router;