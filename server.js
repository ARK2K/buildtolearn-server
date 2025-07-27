import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import submissionRoutes from './routes/submissionRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/submissions', submissionRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
  })
  .catch((err) => console.error('MongoDB connection failed:', err));