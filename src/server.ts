import 'dotenv/config';

import express from 'express';
import connectDB from './database/db';
import { searchMovie } from './services/tmdb.services';
import router from './routers/ai.router';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB();

app.get('/', (_req, res) => {
  res.send('Flixora Server is running 🚀');
});

// ai router API 
app.use('/api',router)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
