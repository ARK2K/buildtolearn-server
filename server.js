const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const submissionRoutes = require('./routes/submissionRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const socket = require('./utils/socket'); // ✅ Socket module

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

// Root route
app.get('/', (req, res) => res.send('Welcome to BuildToLearn API'));

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