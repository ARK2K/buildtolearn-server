const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    challengeId: { type: String, required: true, index: true },
    challengeTitle: { type: String, required: true },

    // Best score for this user on this challenge
    bestScore: { type: Number, required: true },

    // Keep the code of the best attempt so we can replay from leaderboards
    html: { type: String, default: '' },
    css: { type: String, default: '' },
    js: { type: String, default: '' },
  },
  { timestamps: true }
);

// Unique per (user, challenge)
leaderboardSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
// Fast top-N per challenge
leaderboardSchema.index({ challengeId: 1, bestScore: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);