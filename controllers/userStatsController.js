const UserStats = require('../models/UserStats');

// GET /api/user-stats/me
const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;
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

// Called after every submission
const updateUserStats = async ({ userId, displayName, score }) => {
  let stats = await UserStats.findOne({ userId });

  if (!stats) {
    stats = new UserStats({
      userId,
      displayName,
      totalScore: 0,
      weeklyScore: 0,
      badges: [],
      streak: 0,
    });
  }

  // Update scores
  stats.totalScore += score;
  stats.weeklyScore += score;

  // Handle streak using UTC day (prevents timezone issues)
  const today = new Date().toISOString().split('T')[0];
  const lastActive = stats.lastActiveDate;

  if (lastActive === today) {
    // already active today → no streak change
  } else if (
    lastActive ===
    new Date(Date.now() - 86400000).toISOString().split('T')[0]
  ) {
    stats.streak = (stats.streak || 0) + 1;
  } else {
    stats.streak = 1;
  }

  stats.lastActiveDate = today;

  // Award streak badges
  if (stats.streak === 7 && !stats.badges.includes('🔥 7-day streak')) {
    stats.badges.push('🔥 7-day streak');
  }
  if (stats.streak === 30 && !stats.badges.includes('⚡ 30-day streak')) {
    stats.badges.push('⚡ 30-day streak');
  }

  // Award score-based badges
  if (stats.totalScore >= 1000 && !stats.badges.includes('🥇 Gold Scorer')) {
    stats.badges.push('🥇 Gold Scorer');
  }
  if (stats.totalScore >= 500 && !stats.badges.includes('🥈 Silver Scorer')) {
    stats.badges.push('🥈 Silver Scorer');
  }

  await stats.save();
  return stats;
};

module.exports = { getMyStats, getWeeklyLeaderboard, updateUserStats };