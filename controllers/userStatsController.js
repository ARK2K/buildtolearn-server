const UserStats = require('../models/UserStats');
const { updateUserStats } = require('../utils/userStats');

// GET /api/user-stats/me → fetch logged-in user's current stats
const getMyStats = async (req, res) => {
  try {
    const userId = req.auth.userId; // Clerk's auth
    const stats = await UserStats.findOne({ userId });

    if (!stats) {
      // Return a default object instead of 404
      return res.json({
        userId,
        displayName: '',
        totalScore: 0,
        weeklyScore: 0,
        streak: 0,
        badges: [],
        weeklyHistory: [],
      });
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

// GET /api/user-stats/history → logged-in user's archived weekly results
const getMyHistory = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const stats = await UserStats.findOne({ userId }).select('weeklyHistory');

    // Always return an array (empty if no history or no user stats yet)
    const history = stats?.weeklyHistory || [];

    // Sort history by week start date (oldest → newest for streak progression)
    const sortedHistory = history.sort(
      (a, b) => new Date(a.weekStart) - new Date(b.weekStart)
    );

    // Track streak progression
    let streakCounter = 0;
    const formattedHistory = sortedHistory.map(entry => {
      const weekStart = new Date(entry.weekStart);
      const weekEnd = new Date(entry.weekEnd);

      // Update streak (resets if no submissions or score is 0)
      if (entry.submissions > 0 || entry.score > 0) {
        streakCounter += 1;
      } else {
        streakCounter = 0;
      }

      const label = `${weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${weekEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`;

      return {
        ...entry.toObject(),
        label,
        streak: streakCounter,
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