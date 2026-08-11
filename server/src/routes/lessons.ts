import express from 'express';
import { authenticate } from './auth';
import { getDailyLesson, getLessons } from '../services/lessonManager';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  res.json({ dailyLesson: getDailyLesson(), lessons: getLessons() });
});

export default router;
