const UserStats = require('../models/UserStats');
const { updateUserStats } = require('../utils/userStats');
const { formatHistory } = require('../utils/formatHistory');

// GET /api/user-stats/me
const getMyStats = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const stats = await UserStats.findOne({ userId });

    if (!stats) {
      return res.json({
        userId,
        displayName: '',
        totalScore: 0,
        weeklyScore: 0,
        streak: 0,
        highestStreak: 0,
        badges: [],
        weeklyHistory: [],
      });
    }

    const { currentStreak, highestStreak } = formatHistory(stats.weeklyHistory || []);

    res.json({
      ...stats.toObject(),
      streak: currentStreak,
      highestStreak,
    });
  } catch (err) {
    console.error('User stats error:', err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

// GET /api/user-stats/weekly
const getWeeklyLeaderboard = async (req, res) => {
  try {
    const leaderboard = await UserStats.find({})
      .sort({ weeklyScore: -1 })
      .limit(10)
      .select('displayName weeklyScore badges weeklyHistory');

    const leaderboardWithStreaks = leaderboard.map((user) => {
      const { currentStreak, highestStreak } = formatHistory(user.weeklyHistory || []);
      return {
        displayName: user.displayName,
        weeklyScore: user.weeklyScore,
        badges: user.badges,
        streak: currentStreak,
        highestStreak,
      };
    });

    res.json(leaderboardWithStreaks);
  } catch (err) {
    console.error('Weekly leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
};

// GET /api/user-stats/history
const getMyHistory = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const stats = await UserStats.findOne({ userId }).select('weeklyHistory');

    const { history, currentStreak, highestStreak } = formatHistory(stats?.weeklyHistory || []);

    res.json({ history, currentStreak, highestStreak });
  } catch (err) {
    console.error('User history error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly history' });
  }
};

module.exports = {
  getMyStats,
  getWeeklyLeaderboard,
  getMyHistory,
  updateUserStats,
};