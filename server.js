const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const submissionRoutes = require('./routes/submissionRoutes');
const challengeRoutes = require('./routes/challengeRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);

app.get('/', (req, res) => res.send('Welcome to BuildToLearn API'));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('MongoDB connection failed:', err));

// Socket.IO events
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
  });

  socket.on('code-change', ({ roomId, html, css, js }) => {
    socket.to(roomId).emit('code-update', { html, css, js });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});