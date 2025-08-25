const mongoose = require('mongoose');

const weeklyHistorySchema = new mongoose.Schema({
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  score: { type: Number, required: true },
}, { _id: false });

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  totalScore: { type: Number, default: 0 },
  weeklyScore: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  badges: [{ type: String }],
  lastActiveDate: { type: String },
  weeklyHistory: [weeklyHistorySchema],
}, { timestamps: true });

module.exports = mongoose.model('UserStats', userStatsSchema);