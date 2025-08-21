const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, index: true },
    displayName: String,
    totalScore: { type: Number, default: 0 },
    badges: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserStats', userStatsSchema);