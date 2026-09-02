import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './database/db';
import router from './routers/ai.router';
import profileRouter from './routers/profile.router';
import planRoute from './routers/plan.route';
import paymentRouter from './routers/payment.router';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://flixora-client.vercel.app',
  'https://flixora.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Database Connection
connectDB();

app.get('/', (_req, res) => {
  res.send('Flixora Server is running 🚀');
});

// All API Routers mounted under /api
app.use('/api', router);
app.use('/api', profileRouter);
app.use('/api', planRoute);
app.use('/api', paymentRouter);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
