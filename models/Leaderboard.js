const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: String,
  username: String,
  challengeId: String,
  challengeTitle: String,
  bestScore: Number,
  updatedAt: { type: Date, default: Date.now },
});

leaderboardSchema.index({ challengeId: 1, bestScore: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);