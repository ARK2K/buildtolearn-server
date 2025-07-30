const express = require('express');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const {
  createSubmission,
  getUserSubmissions,
  getLeaderboard,
} = require('../controllers/submissionController');

const router = express.Router();

router.post('/', requireClerkAuth, createSubmission);
router.get('/user', requireClerkAuth, getUserSubmissions);
router.get('/leaderboard/:challengeId', getLeaderboard);

module.exports = router;