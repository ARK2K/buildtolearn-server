const Leaderboard = require('../models/Leaderboard');

const getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    if (!challengeId) return res.status(400).json({ error: 'Challenge ID required' });

    const rows = await Leaderboard.find({ challengeId })
      .sort({ bestScore: -1, updatedAt: 1 })
      .limit(10)
      .lean();

    // Attach “badge” like before
    const withBadges = rows.map((entry, index) => ({
      ...entry,
      score: entry.bestScore, // keep field name “score” for UI
      badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
    }));

    res.json(withBadges);
  } catch (err) {
    console.error('Challenge leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

const getGlobalLeaderboard = async (_req, res) => {
  try {
    // Top best scores across all challenges
    const top = await Leaderboard.find({})
      .sort({ bestScore: -1, updatedAt: 1 })
      .limit(50)
      .select('username challengeTitle bestScore updatedAt html css js')
      .lean();

    // Keep frontend shape (score + submittedAt)
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

module.exports = {
  getChallengeLeaderboard,
  getGlobalLeaderboard,
};