import 'dotenv/config';

import express from 'express';
import connectDB from './database/db';
import router from './routers/ai.router';
import profileRouter from './routers/profile.router';
import planRoute from './routers/plan.route';
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 5000;

// accept json data from frontend call with increased limit for base64 images
app.use(express.json({ limit: '10mb' }));

// Allow all origin
app.use(cors());

connectDB();

app.get('/', (_req, res) => {
  res.send('Flixora Server is running 🚀');
});

// routers API
app.use('/api', router);
app.use('/api', profileRouter);
app.use('/api/plans', planRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
