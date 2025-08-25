const UserStats = require('../models/UserStats');
const { updateUserStats } = require('../utils/userStats');

// GET /api/user-stats/me
const getMyStats = async (req, res) => {
  try {
    const userId = req.auth.userId; // ⚡ using Clerk's auth
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

// GET /api/user-stats/history → fetch logged-in user's archived weekly results
const getMyHistory = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const stats = await UserStats.findOne({ userId }).select('weeklyHistory');

    if (!stats) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    // Sort history newest first
    const sortedHistory = (stats.weeklyHistory || [])
      .sort((a, b) => new Date(b.weekEnd) - new Date(a.weekEnd));

    // Add "label" for charting convenience (like "Aug 12 - Aug 18")
    const formattedHistory = sortedHistory.map(entry => {
      const weekStart = new Date(entry.weekStart);
      const weekEnd = new Date(entry.weekEnd);

      const label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      return {
        ...entry.toObject(),
        label,
      };
    });

    res.json(formattedHistory);
  } catch (err) {
    console.error('User history error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly history' });
  }
};

module.exports = { 
  getMyStats, 
  getWeeklyLeaderboard, 
  getMyHistory, 
  updateUserStats 
};