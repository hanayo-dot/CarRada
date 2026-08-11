import express from 'express';
import { authenticate } from './auth';
import { createDiagnosticSession, listDiagnosticSessions, getDiagnosticSession, getSessionMessages, generateDiagnosticSummary } from '../services/diagnosticManager';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const userId = (req as any).userId;
  const sessions = await listDiagnosticSessions(userId);
  res.json(sessions);
});

router.post('/', async (req, res) => {
  const userId = (req as any).userId;
  const { vehicleId, sessionName } = req.body;
  if (!sessionName || typeof sessionName !== 'string') {
    return res.status(400).json({ message: 'Session name is required.' });
  }

  const session = await createDiagnosticSession(userId, vehicleId || null, sessionName);
  res.status(201).json(session);
});

router.get('/:id', async (req, res) => {
  const userId = (req as any).userId;
  const sessionId = Number(req.params.id);
  const session = await getDiagnosticSession(userId, sessionId);
  if (!session) {
    return res.status(404).json({ message: 'Diagnostic session not found.' });
  }
  const messages = await getSessionMessages(userId, sessionId);
  res.json({ ...session, messages });
});

router.post('/:id/summary', async (req, res) => {
  const userId = (req as any).userId;
  const sessionId = Number(req.params.id);
  try {
    const summary = await generateDiagnosticSummary(userId, sessionId);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to generate summary.' });
  }
});

export default router;
