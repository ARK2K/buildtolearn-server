const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  difficulty: String,
  htmlStarter: String,
  cssStarter: String,
  jsStarter: String,
});

module.exports = mongoose.model('Challenge', challengeSchema);