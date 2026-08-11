import express from 'express';
import { query } from '../db';
import { authenticate } from './auth';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const userId = (req as any).userId;
  const result = await query('SELECT * FROM vehicles WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const userId = (req as any).userId;
  const { name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin } = req.body;
  const result = await query(
    `INSERT INTO vehicles (user_id, name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [userId, name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin]
  );
  res.status(201).json(result.rows[0]);
});

router.get('/:id', async (req, res) => {
  const userId = (req as any).userId;
  const result = await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
  if (!result.rows.length) {
    return res.status(404).json({ message: 'Vehicle not found.' });
  }
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin } = req.body;
  const result = await query(
    `UPDATE vehicles SET name=$1, make=$2, model=$3, year=$4, trim=$5, engine=$6, fuel_type=$7, transmission=$8, mileage=$9, vin=$10, updated_at=now()
     WHERE id=$11 AND user_id=$12 RETURNING *`,
    [name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin, req.params.id, userId]
  );
  if (!result.rows.length) {
    return res.status(404).json({ message: 'Vehicle not found.' });
  }
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const userId = (req as any).userId;
  await query('DELETE FROM vehicles WHERE id=$1 AND user_id=$2', [req.params.id, userId]);
  res.status(204).end();
});

export default router;
