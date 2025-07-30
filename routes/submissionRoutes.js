const express = require('express');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const {
  createSubmission,
  getUserSubmissions,
  getLeaderboard,
} = require('../controllers/submissionController');

const router = express.Router();

// 🔐 Protected routes
router.post('/', requireClerkAuth, createSubmission);
router.get('/user', requireClerkAuth, getUserSubmissions);

// 🌐 Public route — leaderboard per challenge
router.get('/leaderboard', getLeaderboard);

module.exports = router;