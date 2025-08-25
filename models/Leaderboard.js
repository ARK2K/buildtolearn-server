const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    // 🔹 For challenge-specific leaderboard entries
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    challengeId: { type: String, index: true }, // optional for weekly
    challengeTitle: { type: String },

    // Best score for this user on this challenge
    bestScore: { type: Number },

    // Keep the code of the best attempt so we can replay from leaderboards
    html: { type: String, default: '' },
    css: { type: String, default: '' },
    js: { type: String, default: '' },

    // 🔹 For weekly archived leaderboard snapshots
    type: { type: String, enum: ['challenge', 'weekly'], default: 'challenge' },
    weekStart: { type: Date },
    weekEnd: { type: Date },
    entries: [
      {
        userId: String,
        username: String,
        score: Number,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
leaderboardSchema.index({ userId: 1, challengeId: 1 }, { unique: true, sparse: true }); // unique per (user, challenge)
leaderboardSchema.index({ challengeId: 1, bestScore: -1 }); // fast top-N per challenge
leaderboardSchema.index({ type: 1, weekStart: -1 }); // fast weekly queries

module.exports = mongoose.model('Leaderboard', leaderboardSchema);