const Leaderboard = require('../models/Leaderboard');

// Challenge-specific leaderboard
const getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    if (!challengeId) return res.status(400).json({ error: 'Challenge ID required' });

    const rows = await Leaderboard.find({ challengeId })
      .sort({ bestScore: -1, updatedAt: 1 })
      .limit(10)
      .lean();

    const withBadges = rows.map((entry, index) => ({
      ...entry,
      score: entry.bestScore,
      badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
    }));

    res.json(withBadges);
  } catch (err) {
    console.error('Challenge leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// Global leaderboard (across all challenges)
const getGlobalLeaderboard = async (_req, res) => {
  try {
    const top = await Leaderboard.find({})
      .sort({ bestScore: -1, updatedAt: 1 })
      .limit(50)
      .select('username challengeTitle bestScore updatedAt html css js')
      .lean();

    const shaped = top.map((r) => ({
      ...r,
      score: r.bestScore,
      submittedAt: r.updatedAt,
    }));

    res.json(shaped);
  } catch (err) {
    console.error('Global leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch global leaderboard' });
  }
};

// Weekly leaderboard (Monday–Sunday)
const getWeeklyLeaderboard = async (_req, res) => {
  try {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1); // Monday start
    monday.setHours(0, 0, 0, 0);

    const top = await Leaderboard.find({ updatedAt: { $gte: monday } })
      .sort({ bestScore: -1, updatedAt: 1 })
      .limit(20)
      .lean();

    const withBadges = top.map((entry, index) => ({
      ...entry,
      score: entry.bestScore,
      badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
    }));

    res.json(withBadges);
  } catch (err) {
    console.error('Weekly leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
};

module.exports = {
  getChallengeLeaderboard,
  getGlobalLeaderboard,
  getWeeklyLeaderboard,
};