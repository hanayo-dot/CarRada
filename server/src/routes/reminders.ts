import express from 'express';
import { authenticate } from './auth';
import { query } from '../db';

const router = express.Router();
router.use(authenticate);

function calculateNotificationAt(dueDate: string | null, notificationDays: number | null) {
  if (!dueDate) {
    return null;
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  parsed.setDate(parsed.getDate() - (notificationDays ?? 7));
  return parsed.toISOString().split('T')[0];
}

router.get('/', async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const result = await query(
      `SELECT id, description, due_date, due_mileage, completed, notification_enabled, notification_days, notification_at, created_at, updated_at
       FROM maintenance_reminders
       WHERE user_id = $1
       ORDER BY completed, due_date NULLS LAST, due_mileage NULLS LAST, updated_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const { description, due_date, due_mileage, notification_enabled, notification_days } = req.body;
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ message: 'Reminder description is required.' });
    }

    const enabled = typeof notification_enabled === 'boolean' ? notification_enabled : true;
    const days = Number.isInteger(notification_days) ? notification_days : 7;
    const notificationAt = calculateNotificationAt(due_date || null, days);

    const result = await query(
      `INSERT INTO maintenance_reminders (user_id, description, due_date, due_mileage, notification_enabled, notification_days, notification_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, description.trim(), due_date || null, due_mileage || null, enabled, days, notificationAt]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const reminderId = Number(req.params.id);
    if (Number.isNaN(reminderId)) {
      return res.status(400).json({ message: 'Invalid reminder ID.' });
    }

    const { description, due_date, due_mileage, completed, notification_enabled, notification_days } = req.body;
    const days = Number.isInteger(notification_days) ? notification_days : null;
    const notificationAt = notification_days !== undefined ? calculateNotificationAt(due_date || null, days) : null;

    const toParam = (v: any) => (v === undefined ? null : v);

    const result = await query(
      `UPDATE maintenance_reminders
       SET description = COALESCE($1, description),
           due_date = COALESCE($2, due_date),
           due_mileage = COALESCE($3, due_mileage),
           completed = COALESCE($4, completed),
           notification_enabled = COALESCE($5, notification_enabled),
           notification_days = COALESCE($6, notification_days),
           notification_at = COALESCE($7, notification_at),
           updated_at = now()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        toParam(description),
        toParam(due_date),
        toParam(due_mileage),
        toParam(completed),
        toParam(notification_enabled),
        toParam(days),
        toParam(notificationAt),
        reminderId,
        userId
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Reminder not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const reminderId = Number(req.params.id);
    if (Number.isNaN(reminderId)) {
      return res.status(400).json({ message: 'Invalid reminder ID.' });
    }

    await query('DELETE FROM maintenance_reminders WHERE id = $1 AND user_id = $2', [reminderId, userId]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
