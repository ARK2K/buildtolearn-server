const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const Leaderboard = require('../models/Leaderboard');
const UserStats = require('../models/UserStats');
const clerk = require('@clerk/clerk-sdk-node');
const io = require('../utils/socket');
const { gradeSubmission } = require('../utils/grader');

const PASS_THRESHOLD = 70; // tweak as you like

// derive a simple feedback string from the grader’s breakdown
const buildFeedback = (breakdown) => {
  if (!breakdown) return 'Submitted.';
  const parts = [];
  if (breakdown.html) parts.push(`HTML ${breakdown.html.score}/40`);
  if (breakdown.css) parts.push(`CSS ${breakdown.css.score}/30`);
  if (breakdown.js) parts.push(`JS ${breakdown.js.score}/30`);
  return `Breakdown: ${parts.join(' · ')}`;
};

const createSubmission = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { challengeId, html = '', css = '', js = '', challengeTitle } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // Grade using your utils/grader (returns { score, breakdown })
    const grade = await gradeSubmission({
      expectedHTML: challenge.targetHTML,
      expectedCSSRules: (challenge.cssRules || []).map((r) => ({
        selector: r.selector,
        styles: { [r.property]: r.value },
      })),
      submittedHTML: html,
      submittedCSS: css,
      submittedJS: js,
      behaviorTests: [], // plug in later if you add DOM tests
    });

    const score = Math.round(grade.score || 0);
    const passed = score >= PASS_THRESHOLD;
    const feedback = buildFeedback(grade.breakdown);

    // Clerk username/email
    const user = await clerk.users.getUser(userId);
    const username =
      user.username || user.emailAddresses?.[0]?.emailAddress || 'Anonymous';

    // Save submission history
    const submission = await Submission.create({
      userId,
      username,
      challengeId,
      challengeTitle: challenge.title || challengeTitle || 'Challenge',
      html,
      css,
      js,
      score,
      passed,
      feedback,
    });

    // Upsert into Leaderboard if this is a new best
    const existing = await Leaderboard.findOne({ userId, challengeId });
    let deltaForStats = 0;

    if (!existing || score > existing.bestScore) {
      const prevBest = existing?.bestScore || 0;
      deltaForStats = score - prevBest;

      await Leaderboard.findOneAndUpdate(
        { userId, challengeId },
        {
          $set: {
            username,
            challengeTitle: challenge.title || challengeTitle || 'Challenge',
            html,
            css,
            js,
          },
          $max: { bestScore: score },
        },
        { upsert: true, new: true }
      );
    }

    // Update UserStats (sum of bests). Only add the delta for improved bests.
    if (deltaForStats !== 0) {
      await UserStats.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: {
            displayName: username,
            totalScore: 0,
            badges: [],
          },
          $inc: { totalScore: deltaForStats },
        },
        { upsert: true }
      );
    }

    // Emit socket updates
    const ioInstance = io.getIO();
    ioInstance.to(`leaderboard-${challengeId}`).emit('leaderboard-update', challengeId);
    ioInstance.emit('global-leaderboard-update');

    res.status(201).json({
      success: true,
      score,
      passed,
      feedback,
      submission,
    });
  } catch (err) {
    console.error('Create Submission Error:', err);
    res.status(500).json({ error: 'Failed to create submission' });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const submissions = await Submission.find({ userId }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error('Get Submissions Error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

module.exports = {
  createSubmission,
  getUserSubmissions,
};