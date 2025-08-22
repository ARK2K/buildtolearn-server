const UserStats = require('../models/UserStats');

// GET /api/user-stats/me
const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id; // assuming Clerk or JWT middleware attaches user
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

// Update stats after submission
const updateUserStats = async ({ userId, displayName, score }) => {
  let stats = await UserStats.findOne({ userId });

  if (!stats) {
    stats = new UserStats({ userId, displayName, totalScore: 0, badges: [] });
  }

  // Add to total score
  stats.totalScore += score;

  // Handle streak
  const today = new Date().toDateString();
  const lastActive = stats.updatedAt ? new Date(stats.updatedAt).toDateString() : null;

  if (lastActive === today) {
    // already active today → streak unchanged
  } else if (lastActive === new Date(Date.now() - 86400000).toDateString()) {
    stats.streak = (stats.streak || 0) + 1;
  } else {
    stats.streak = 1; // reset
  }

  // Award badges
  if (stats.streak === 7 && !stats.badges.includes('🔥 7-day streak')) {
    stats.badges.push('🔥 7-day streak');
  }
  if (stats.streak === 30 && !stats.badges.includes('⚡ 30-day streak')) {
    stats.badges.push('⚡ 30-day streak');
  }

  await stats.save();
  return stats;
};

module.exports = { getMyStats, updateUserStats };