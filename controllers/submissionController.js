const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const clerk = require('@clerk/clerk-sdk-node');
const io = require('../utils/socket');
const { gradeSubmission } = require('../utils/grader');

const createSubmission = async (req, res) => {
  console.log('Submission payload:', req.body);
  console.log('Clerk User ID:', req.auth.userId);

  try {
    const userId = req.auth.userId;
    const { challengeId, html, css, js } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // 🧠 Improved grading logic
    const { score, feedback, passed } = gradeSubmission({
      challenge,
      html,
      css,
      js,
    });

    // 👤 Clerk username fetch
    const user = await clerk.users.getUser(userId);
    const username = user.username || user.emailAddresses[0]?.emailAddress || 'Anonymous';

    // 📥 Save the submission
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

    // 🔁 Emit leaderboard updates
    io.getIO().emit('leaderboard-update', challengeId);
    io.getIO().emit('leaderboard-update-global');

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

const getLeaderboard = async (req, res) => {
  try {
    const challengeId = req.params.challengeId;
    if (!challengeId) return res.status(400).json({ error: 'Challenge ID required' });

    const top = await Submission.aggregate([
      { $match: { challengeId } },
      { $sort: { score: -1, submittedAt: 1 } },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$username' },
          score: { $first: '$score' },
          html: { $first: '$html' },
          css: { $first: '$css' },
          js: { $first: '$js' },
        },
      },
      { $sort: { score: -1 } },
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

const getGlobalLeaderboard = async (req, res) => {
  try {
    const top = await Submission.find()
      .sort({ score: -1, submittedAt: 1 })
      .limit(50)
      .select('username challengeTitle score submittedAt');

    res.json(top);
  } catch (err) {
    console.error('Global Leaderboard Error:', err);
    res.status(500).json({ error: 'Failed to fetch global leaderboard' });
  }
};

module.exports = {
  createSubmission,
  getUserSubmissions,
  getLeaderboard,
  getGlobalLeaderboard,
};