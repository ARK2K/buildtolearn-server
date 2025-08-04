const Submission = require('../models/Submission');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const getLeaderboard = async (req, res) => {
  try {
    const topScores = await Submission.aggregate([
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$score' },
        },
      },
      { $sort: { bestScore: -1 } },
      { $limit: 50 },
    ]);

    const userIds = topScores.map((entry) => entry._id);
    const users = await clerkClient.users.getUserList({ userId: userIds });

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user.username || user.emailAddresses?.[0]?.emailAddress || 'Anonymous';
    });

    const result = topScores.map((entry) => ({
      userId: entry._id,
      username: userMap[entry._id] || 'Unknown',
      bestScore: entry.bestScore,
    }));

    res.json(result);
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = { getLeaderboard };