import express from 'express';
import { getEmergencyList, getEmergencyProcedure } from '../services/emergencyProcedures';
import { authenticate } from './auth';

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  res.json(getEmergencyList());
});

router.get('/:slug', (req, res) => {
  const procedure = getEmergencyProcedure(req.params.slug);
  if (!procedure) {
    return res.status(404).json({ message: 'Emergency flow not found.' });
  }
  res.json(procedure);
});

export default router;
