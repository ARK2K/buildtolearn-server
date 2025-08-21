const express = require('express');
const router = express.Router();
const {
  getChallengeLeaderboard,
  getGlobalLeaderboard,
} = require('../controllers/leaderboardController');

// Per-challenge leaderboard
router.get('/challenge/:challengeId', getChallengeLeaderboard);

// 🌍 Global leaderboard
router.get('/global', getGlobalLeaderboard);

module.exports = router;