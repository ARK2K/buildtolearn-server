const UserStats = require('../models/UserStats');
const { updateUserStats } = require('../utils/userStats');

// --- helper to compute dynamic streak from history ---
function computeCurrentStreak(weeklyHistory = []) {
  if (!weeklyHistory.length) return 0;

  // Sort by week start date
  const sorted = [...weeklyHistory].sort(
    (a, b) => new Date(a.weekStart) - new Date(b.weekStart)
  );

  let streak = 0;
  let prevWeekEnd = null;

  // Traverse backwards from most recent week
  for (let i = sorted.length - 1; i >= 0; i--) {
    const entry = sorted[i];
    const weekStart = new Date(entry.weekStart);
    const weekEnd = new Date(entry.weekEnd);

    const missedWeek =
      prevWeekEnd &&
      weekStart - prevWeekEnd > 7 * 24 * 60 * 60 * 1000; // gap > 7 days

    if ((entry.submissions > 0 || entry.score > 0) && !missedWeek) {
      streak++;
    } else {
      break; // streak ends
    }

    prevWeekEnd = weekStart;
  }

  return streak;
}

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

    // Compute streak dynamically
    const currentStreak = computeCurrentStreak(stats.weeklyHistory);

    res.json({
      ...stats.toObject(),
      streak: currentStreak,
    });
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
      .select('displayName weeklyScore badges weeklyHistory'); // also fetch weeklyHistory

    // Compute streak dynamically for each user
    const leaderboardWithStreaks = leaderboard.map((user) => {
      const streak = computeCurrentStreak(user.weeklyHistory || []);
      return {
        displayName: user.displayName,
        weeklyScore: user.weeklyScore,
        badges: user.badges,
        streak,
      };
    });

    res.json(leaderboardWithStreaks);
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

    const history = stats?.weeklyHistory || [];

    // Sort history oldest → newest
    const sortedHistory = history.sort(
      (a, b) => new Date(a.weekStart) - new Date(b.weekStart)
    );

    let streakCounter = 0;
    let prevWeekEnd = null;

    const formattedHistory = sortedHistory.map((entry) => {
      const entryObj = entry.toObject ? entry.toObject() : entry;
      const weekStart = new Date(entryObj.weekStart);
      const weekEnd = new Date(entryObj.weekEnd);

      const missedWeek =
        prevWeekEnd &&
        weekStart - prevWeekEnd > 7 * 24 * 60 * 60 * 1000; // gap > 7 days

      if ((entryObj.submissions > 0 || entryObj.score > 0) && !missedWeek) {
        streakCounter += 1;
      } else {
        streakCounter = 0;
      }

      prevWeekEnd = weekEnd;

      return {
        ...entryObj,
        label: `${weekStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`,
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
  updateUserStats,
};