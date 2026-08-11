import express from 'express';
import cors from 'cors';
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
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/assistant', assistantRoutes);
app.use('/conversations', conversationRoutes);
app.use('/diagnostics', diagnosticRoutes);
app.use('/emergencies', emergencyRoutes);
app.use('/reminders', reminderRoutes);
app.use('/lessons', lessonRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CarRada server is running.' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Server error', detail: err.message });
});

export default app;
