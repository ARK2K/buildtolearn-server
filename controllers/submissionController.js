const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');

const createSubmission = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { challengeId, html, css, js } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // ✅ Basic HTML grading: normalize and compare HTML
    const normalize = (str) => (str || '').trim().replace(/\s+/g, ' ');
    const expectedHTML = normalize(challenge.htmlStarter);
    const submittedHTML = normalize(html);

    const score = submittedHTML === expectedHTML ? 100 : 50;
    const passed = score >= 80;
    const feedback = passed
      ? '✅ Well done! Your HTML matches the expected structure.'
      : '❌ Your HTML is close, but not quite there. Try again!';

    // ✅ Save submission
    const submission = await Submission.create({
      userId,
      challengeId,
      challengeTitle: challenge.title,
      html,
      css,
      js,
      score,
      passed,
      feedback,
    });

    res.status(201).json({
      success: true,
      score,
      passed,
      feedback,
      submissionId: submission._id,
    });
  } catch (err) {
    console.error('Submission error:', err);
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