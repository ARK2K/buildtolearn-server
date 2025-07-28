const Submission = require('../models/Submission');

const createSubmission = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const {
      challengeId,
      challengeTitle,
      html,
      css,
      js,
      score,
      passed,
      feedback,
    } = req.body;

    const submission = await Submission.create({
      userId,
      challengeId,
      challengeTitle,
      html,
      css,
      js,
      score,
      passed,
      feedback,
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create submission' });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const submissions = await Submission.find({ userId }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

module.exports = { createSubmission, getUserSubmissions };