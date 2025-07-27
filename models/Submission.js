import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  challengeId: { type: String, required: true },
  challengeTitle: { type: String, required: true },
  html: String,
  css: String,
  js: String,
  score: Number,
  passed: Boolean,
  feedback: String,
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Submission', submissionSchema);