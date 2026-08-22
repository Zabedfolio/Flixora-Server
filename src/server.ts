import 'dotenv/config';

import express from 'express';
import connectDB from './database/db';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB();

app.get('/', (_req, res) => {
  res.send('Flixora Server is running 🚀');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
