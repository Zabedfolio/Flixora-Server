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

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Database Connection
connectDB();

app.get('/', (_req, res) => {
  res.send('Flixora Server is running 🚀');
});

// Routers API
app.use('/api', router);
app.use('/api', profileRouter);
app.use('/api/plans', planRoute);
app.use('/api', paymentRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
