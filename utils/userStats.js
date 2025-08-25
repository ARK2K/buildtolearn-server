const UserStats = require('../models/UserStats');

const updateUserStats = async ({ userId, displayName, delta }) => {
  let stats = await UserStats.findOne({ userId });

  if (!stats) {
    stats = new UserStats({
      userId,
      displayName,
      totalScore: 0,
      weeklyScore: 0,
      streak: 0,
      badges: [],
    });
  }

  // Update scores
  stats.totalScore += delta;
  stats.weeklyScore += delta;

  // Handle streak using UTC date
  const today = new Date().toISOString().split('T')[0];
  const lastActive = stats.lastActiveDate;

  if (lastActive === today) {
    // already active today
  } else if (
    lastActive === new Date(Date.now() - 86400000).toISOString().split('T')[0]
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
  if (stats.totalScore >= 500 && !stats.badges.includes('🥈 Silver Scorer')) {
    stats.badges.push('🥈 Silver Scorer');
  }
  if (stats.totalScore >= 1000 && !stats.badges.includes('🥇 Gold Scorer')) {
    stats.badges.push('🥇 Gold Scorer');
  }
  if (stats.totalScore >= 5000 && !stats.badges.includes('🏆 5000 XP')) {
    stats.badges.push('🏆 5000 XP');
  }

  await stats.save();
  return stats;
};

module.exports = { updateUserStats };