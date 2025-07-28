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

console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
  })
  .catch((err) => console.error('MongoDB connection failed:', err));