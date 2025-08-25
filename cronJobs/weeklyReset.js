const cron = require('node-cron');
const UserStats = require('../models/UserStats');

// Runs every Monday at 00:00
cron.schedule('0 0 * * 1', async () => {
  try {
    console.log('[CRON] Resetting weekly scores...');
    await UserStats.updateMany({}, { $set: { weeklyScore: 0 } });
    console.log('[CRON] Weekly scores reset successful');
  } catch (err) {
    console.error('[CRON] Failed to reset weekly scores:', err);
  }
});