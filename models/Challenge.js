const mongoose = require('mongoose');

const cssRuleSchema = new mongoose.Schema({
  selector: { type: String, required: true },
  styles: { type: Map, of: String, required: true }
}, { _id: false });

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  htmlStarter: String,
  cssStarter: String,
  jsStarter: String,

  // 🆕 Expected output for grading
  expectedHTML: { type: String, required: true },
  expectedCSSRules: [cssRuleSchema],

  gradingLevel: { type: Number, enum: [1, 2], default: 1 } // 1 = HTML only, 2 = HTML + CSS
});

module.exports = mongoose.model('Challenge', challengeSchema);