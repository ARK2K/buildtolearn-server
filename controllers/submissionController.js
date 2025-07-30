const Submission = require('../models/Submission');
const Leaderboard = require('../models/Leaderboard');
const Challenge = require('../models/Challenge');

// Simple grading logic
const gradeSubmission = (starterHtml, submittedHtml) => {
  const clean = (str) => str.replace(/\s+/g, '').toLowerCase();
  const passed = clean(starterHtml) === clean(submittedHtml);
  const score = passed ? 100 : 50;
  const feedback = passed ? 'Perfect Match!' : 'Partial match. Check structure & tags.';
  return { score, passed, feedback };
};

const createSubmission = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { challengeId, html, css, js } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const { score, passed, feedback } = gradeSubmission(challenge.htmlStarter, html);

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

    // Save to leaderboard if high score
    const existing = await Leaderboard.findOne({ userId, challengeId });
    if (!existing || score > existing.score) {
      await Leaderboard.findOneAndUpdate(
        { userId, challengeId },
        { userId, challengeId, challengeTitle: challenge.title, score, submittedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      success: true,
      score,
      passed,
      feedback,
      submission,
    });
  } catch (err) {
    console.error(err);
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

const getLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const topScores = await Leaderboard.find({ challengeId })
      .sort({ score: -1, submittedAt: 1 })
      .limit(10);
    res.json(topScores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
};

module.exports = {
  createSubmission,
  getUserSubmissions,
  getLeaderboard,
};