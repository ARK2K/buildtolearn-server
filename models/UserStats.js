const mongoose = require('mongoose');
const userStatsSchema = new mongoose.Schema({
  userId: String,
  displayName: String,
  totalScore: Number,
  badges: [String],
});

module.exports = mongoose.model('UserStats', userStatsSchema);