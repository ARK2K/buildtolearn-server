const Submission = require('../models/Submission');
const { Clerk } = require('@clerk/clerk-sdk-node');
const io = require('../socket'); // <== make sure you export Socket.IO instance from server.js

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const createSubmission = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const {
      challengeId,
      html,
      css,
      js,
    } = req.body;

    // Fetch the challenge title for better readability
    const Challenge = require('../models/Challenge');
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // 🔍 Simple grading logic
    const score = html.includes('<button>') ? 100 : 50;
    const passed = score >= 80;
    const feedback = passed ? 'Great job!' : 'Try adding the button tag.';

    // ✅ Get Clerk username
    const user = await clerk.users.getUser(userId);
    const username = user.username || user.emailAddresses[0]?.emailAddress || 'Anonymous';

    // 📥 Save submission
    const submission = await Submission.create({
      userId,
      username,
      challengeId,
      challengeTitle: challenge.title,
      html,
      css,
      js,
      score,
      passed,
      feedback,
    });

    // Emit real-time leaderboard update
    io.getIO().emit('leaderboard-update', { challengeId });

    res.status(201).json({
      success: true,
      score,
      feedback,
      submission,
    });
  } catch (err) {
    console.error('Create Submission Error:', err);
    res.status(500).json({ error: 'Failed to create submission' });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const submissions = await Submission.find({ userId }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error('Get Submissions Error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// 🏆 Per-challenge leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.query;
    if (!challengeId) return res.status(400).json({ error: 'Challenge ID required' });

    const top = await Submission.aggregate([
      { $match: { challengeId } },
      {
        $sort: { score: -1, submittedAt: 1 },
      },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$username' },
          bestScore: { $first: '$score' },
          html: { $first: '$html' },
          css: { $first: '$css' },
          js: { $first: '$js' },
        },
      },
      { $sort: { bestScore: -1 } },
      { $limit: 10 },
    ]);

    const withBadges = top.map((entry, index) => ({
      ...entry,
      badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
    }));

    res.json(withBadges);
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  createSubmission,
  getUserSubmissions,
  getLeaderboard,
};