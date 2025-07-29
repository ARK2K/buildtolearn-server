const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const submissionRoutes = require('./routes/submissionRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/submissions', submissionRoutes);

const challengeRoutes = require('./routes/challengeRoutes');
app.use('/api/challenges', challengeRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Build to Learn API');
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
  })
  .catch((err) => console.error('MongoDB connection failed:', err));