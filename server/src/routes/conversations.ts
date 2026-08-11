import express from 'express';
import { authenticate } from './auth';
import { query } from '../db';

const router = express.Router();
router.use(authenticate);

router.get('/history', async (req, res) => {
  const userId = (req as any).userId;
  const result = await query(
    `SELECT id, role, message, created_at FROM conversations WHERE user_id = $1 ORDER BY created_at ASC LIMIT 200`,
    [userId]
  );
  res.json(result.rows);
});

export default router;
