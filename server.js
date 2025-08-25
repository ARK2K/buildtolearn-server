const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const submissionRoutes = require('./routes/submissionRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const userStatsRoutes = require('./routes/userStatsRoutes'); // ✅ new route
const socket = require('./utils/socket');
const UserStats = require('./models/UserStats'); // ✅ required for cron job

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔌 Initialize Socket.IO
socket.init(server);

// 🌐 Middleware
app.use(cors());
app.use(express.json());

// 🛣️ API Routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/user-stats', userStatsRoutes);

// Root route
app.get('/', (req, res) => res.send('Welcome to BuildToLearn API'));

// 🕒 CRON: Reset weeklyScore every Monday at 00:00 UTC
cron.schedule('0 0 * * 1', async () => {
  try {
    await UserStats.updateMany({}, { $set: { weeklyScore: 0 } });
    console.log('✅ Weekly scores reset successfully');
  } catch (err) {
    console.error('❌ Error resetting weekly scores:', err);
  }
});

// 🔗 MongoDB + start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('MongoDB connection failed:', err));