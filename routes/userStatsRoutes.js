const express = require('express');
const { getMyStats } = require('../controllers/userStatsController');
const { requireAuth } = require('../middleware/clerkAuth'); // adjust if JWT

const router = express.Router();

router.get('/me', requireAuth, getMyStats);

module.exports = router;