import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { NODE_ENV } from './config';
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import assistantRoutes from './routes/assistant';
import conversationRoutes from './routes/conversations';
import diagnosticRoutes from './routes/diagnostics';
import emergencyRoutes from './routes/emergencies';
import reminderRoutes from './routes/reminders';
import lessonRoutes from './routes/lessons';

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Rate limiters to protect auth and AI inference
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again in 15 minutes.' }
});

const assistantLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Assistant rate limit reached. Please wait a moment before trying again.' }
});

app.use('/auth', authLimiter, authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/assistant', assistantLimiter, assistantRoutes);
app.use('/conversations', conversationRoutes);
app.use('/diagnostics', diagnosticRoutes);
app.use('/emergencies', emergencyRoutes);
app.use('/reminders', reminderRoutes);
app.use('/lessons', lessonRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CarRada server is running.', status: 'healthy' });
});

// Centralized error handler with production detail stripping
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err);
  const isProd = NODE_ENV === 'production';
  res.status(500).json({
    message: 'An unexpected server error occurred.',
    ...(isProd ? {} : { detail: err.message })
  });
});

export default app;
