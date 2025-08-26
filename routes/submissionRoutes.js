const express = require('express');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const {
  createSubmission,
  getUserSubmissions,
  getUserWeeklyHistory,
} = require('../controllers/submissionController');

const router = express.Router();

// 🔐 Protected routes
router.post('/', requireClerkAuth, createSubmission);
router.get('/user', requireClerkAuth, getUserSubmissions);

// 📊 New endpoint: get weekly submission history of logged-in user
router.get('/user/history', requireClerkAuth, getUserWeeklyHistory);

module.exports = router;