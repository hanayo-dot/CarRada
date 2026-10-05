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

  if (!name || !make || !model || !year) {
    return res.status(400).json({ message: 'Name, make, model, and year are required.' });
  }

  const parsedYear = Number(year);
  if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 2) {
    return res.status(400).json({ message: 'Please provide a valid vehicle year.' });
  }

  const parsedMileage = mileage !== undefined && mileage !== null ? Number(mileage) : null;

  const result = await query(
    `INSERT INTO vehicles (user_id, name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      userId,
      String(name).trim(),
      String(make).trim(),
      String(model).trim(),
      parsedYear,
      trim ? String(trim).trim() : null,
      engine ? String(engine).trim() : null,
      fuel_type ? String(fuel_type).trim() : null,
      transmission ? String(transmission).trim() : null,
      parsedMileage,
      vin ? String(vin).trim() : null,
    ]
  );
  res.status(201).json(result.rows[0]);
});

router.get('/:id', async (req, res) => {
  const userId = (req as any).userId;
  const vehicleId = Number(req.params.id);
  if (Number.isNaN(vehicleId)) {
    return res.status(400).json({ message: 'Invalid vehicle ID.' });
  }

  const result = await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId]);
  if (!result.rows.length) {
    return res.status(404).json({ message: 'Vehicle not found.' });
  }
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const userId = (req as any).userId;
  const vehicleId = Number(req.params.id);
  if (Number.isNaN(vehicleId)) {
    return res.status(400).json({ message: 'Invalid vehicle ID.' });
  }

  // Fetch current vehicle to safely support partial updates
  const existing = await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId]);
  if (!existing.rows.length) {
    return res.status(404).json({ message: 'Vehicle not found.' });
  }

  const current = existing.rows[0];
  const {
    name = current.name,
    make = current.make,
    model = current.model,
    year = current.year,
    trim = current.trim,
    engine = current.engine,
    fuel_type = current.fuel_type,
    transmission = current.transmission,
    mileage = current.mileage,
    vin = current.vin,
  } = req.body;

  const parsedYear = Number(year);
  if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 2) {
    return res.status(400).json({ message: 'Please provide a valid vehicle year.' });
  }

  const parsedMileage = mileage !== undefined && mileage !== null ? Number(mileage) : null;

  const result = await query(
    `UPDATE vehicles SET name=$1, make=$2, model=$3, year=$4, trim=$5, engine=$6, fuel_type=$7, transmission=$8, mileage=$9, vin=$10, updated_at=now()
     WHERE id=$11 AND user_id=$12 RETURNING *`,
    [
      String(name).trim(),
      String(make).trim(),
      String(model).trim(),
      parsedYear,
      trim !== undefined ? (trim ? String(trim).trim() : null) : current.trim,
      engine !== undefined ? (engine ? String(engine).trim() : null) : current.engine,
      fuel_type !== undefined ? (fuel_type ? String(fuel_type).trim() : null) : current.fuel_type,
      transmission !== undefined ? (transmission ? String(transmission).trim() : null) : current.transmission,
      parsedMileage,
      vin !== undefined ? (vin ? String(vin).trim() : null) : current.vin,
      vehicleId,
      userId,
    ]
  );

  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const userId = (req as any).userId;
  const vehicleId = Number(req.params.id);
  if (Number.isNaN(vehicleId)) {
    return res.status(400).json({ message: 'Invalid vehicle ID.' });
  }

  await query('DELETE FROM vehicles WHERE id=$1 AND user_id=$2', [vehicleId, userId]);
  res.status(204).end();
});

export default router;
