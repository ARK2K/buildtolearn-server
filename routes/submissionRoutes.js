const express = require('express');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const {
  createSubmission,
  getUserSubmissions,
  getLeaderboard,
  getGlobalLeaderboard,
} = require('../controllers/submissionController');

const router = express.Router();

// 🔐 Protected routes (require valid Clerk JWT)
router.post('/', requireClerkAuth, createSubmission);
router.get('/user', requireClerkAuth, getUserSubmissions);

// 🌐 Public routes (accessible without auth)
router.get('/leaderboard/:challengeId', getLeaderboard); // Per-challenge leaderboard
router.get('/leaderboard/global', getGlobalLeaderboard); // Global leaderboard

module.exports = router;