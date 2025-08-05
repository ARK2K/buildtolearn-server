const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getGlobalLeaderboard,
} = require('../controllers/submissionController');

// Per-challenge leaderboard
router.get('/challenge/:challengeId', getLeaderboard);

// 🌍 Global leaderboard
router.get('/global', getGlobalLeaderboard);

module.exports = router;