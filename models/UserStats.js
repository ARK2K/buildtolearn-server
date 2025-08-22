const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    totalScore: { type: Number, default: 0 },
    weeklyScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: String }, // store YYYY-MM-DD
    badges: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserStats', userStatsSchema);