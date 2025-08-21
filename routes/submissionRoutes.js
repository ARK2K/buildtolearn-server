const express = require('express');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const {
  createSubmission,
  getUserSubmissions,
} = require('../controllers/submissionController');

const router = express.Router();

// 🔐 Protected routes
router.post('/', requireClerkAuth, createSubmission);
router.get('/user', requireClerkAuth, getUserSubmissions);

module.exports = router;