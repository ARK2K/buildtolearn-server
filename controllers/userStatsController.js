const UserStats = require('../models/UserStats');
const { updateUserStats } = require('../utils/userStats'); // 🔥 use shared util

// GET /api/user-stats/me
const getMyStats = async (req, res) => {
  try {
    const userId = req.auth.userId; // ⚡ switched to req.auth for consistency with submissionController
    const stats = await UserStats.findOne({ userId });

    if (!stats) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    res.json(stats);
  } catch (err) {
    console.error('User stats error:', err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

// GET /api/user-stats/weekly → top 10 users by weeklyScore
const getWeeklyLeaderboard = async (req, res) => {
  try {
    const leaderboard = await UserStats.find({})
      .sort({ weeklyScore: -1 })
      .limit(10)
      .select('displayName weeklyScore streak badges');

    res.json(leaderboard);
  } catch (err) {
    console.error('Weekly leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
};

module.exports = { getMyStats, getWeeklyLeaderboard, updateUserStats };