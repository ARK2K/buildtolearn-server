const cron = require('node-cron');
const UserStats = require('../models/UserStats');
const { getIO } = require('../socket');

// Function to reset weekly scores
async function resetWeeklyScores() {
  try {
    console.log('[CRON] Archiving & resetting weekly scores...');

    // 1. Get last week's top 50
    const lastWeekStats = await UserStats.find({})
      .sort({ weeklyScore: -1 })
      .limit(50);

    if (lastWeekStats.length > 0) {
      const weekStart = new Date(new Date().setDate(new Date().getDate() - 7));
      const weekEnd = new Date();

      // 2. Save each user's weekly result into their history
      for (const user of lastWeekStats) {
        await UserStats.updateOne(
          { userId: user.userId },
          {
            $push: {
              weeklyHistory: {
                weekStart,
                weekEnd,
                score: user.weeklyScore,
              },
            },
          }
        );
      }
    }

    // 3. Reset weekly scores for everyone
    await UserStats.updateMany({}, { $set: { weeklyScore: 0 } });
    console.log('[CRON] Weekly scores reset successful');

    // 4. Notify clients
    const io = getIO();
    if (io) {
      io.emit('leaderboard-update', { type: 'weekly' });
      console.log('[CRON] Emitted leaderboard-update event');
    }
  } catch (err) {
    console.error('[CRON] Failed to reset weekly scores:', err);
  }
}

// Runs every Monday at 00:00
cron.schedule('0 0 * * 1', resetWeeklyScores);

module.exports = { resetWeeklyScores };