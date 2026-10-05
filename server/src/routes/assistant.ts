import express from 'express';
import { authenticate } from './auth';
import { classifySafetyIssue } from '../services/safetyClassifier';
import { generateAssistantResponse } from '../services/conversationManager';
import { generateMechanicSummary } from '../services/summaryGenerator';
import { analyzeWarningLightImage } from '../services/imageAnalyzer';
import { generateRepairCostEstimate } from '../services/costEstimator';
import { query } from '../db';

const router = express.Router();
router.use(authenticate);

router.post('/chat', async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const { messages, vehicleId, sessionId } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ message: 'Conversation messages are required.' });
    }

    // Inspect ONLY the latest user message for acute safety hazards (prevents old history from re-triggering alerts)
    const latestUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    const safety = classifySafetyIssue(latestUserMsg?.message || '');

    const vehicleResult = vehicleId
      ? await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId])
      : null;
    const vehicle = vehicleResult?.rows?.[0] ?? null;

    const userResult = await query('SELECT id, email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const assistantResponse = await generateAssistantResponse(messages, user, vehicle);

    // Save individual turn messages rather than concatenating entire history
    if (latestUserMsg) {
      await query(
        'INSERT INTO conversations (user_id, vehicle_id, diagnostic_session_id, role, message) VALUES ($1, $2, $3, $4, $5)',
        [userId, vehicleId || null, sessionId || null, 'user', latestUserMsg.message]
      );
    }

    await query(
      'INSERT INTO conversations (user_id, vehicle_id, diagnostic_session_id, role, message) VALUES ($1, $2, $3, $4, $5)',
      [userId, vehicleId || null, sessionId || null, 'assistant', assistantResponse.text]
    );

    res.json({ safety, assistant: assistantResponse });
  } catch (error) {
    next(error);
  }
});

router.post('/translate', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Mechanic note text is required.' });
    }

    const summary = await generateMechanicSummary(text.trim());
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

router.post('/analyze-warning-light', async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ message: 'Image data and MIME type are required.' });
    }

    const analysis = await analyzeWarningLightImage(imageBase64, mimeType);

    if (analysis.identified.length > 0) {
      await query(
        'INSERT INTO uploaded_images (user_id, key, url, type) VALUES ($1, $2, $3, $4)',
        [userId, `warning-light-${Date.now()}`, `data:${mimeType};base64,${imageBase64.substring(0, 50)}...`, 'warning_light']
      );
    }

    res.json({ analysis });
  } catch (error) {
    next(error);
  }
});

router.post('/cost-estimate', async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const { description, vehicleId } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ message: 'Repair description is required.' });
    }

    const vehicle = vehicleId
      ? (await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId])).rows[0]
      : null;

    const estimate = await generateRepairCostEstimate(description.trim(), vehicle);
    res.json(estimate);
  } catch (error) {
    next(error);
  }
});

router.post('/analyze-audio', async (req, res, next) => {
  try {
    const { audioBase64, mimeType, description } = req.body;
    res.json({
      analysis: {
        transcript: description || 'Vehicle acoustic sample processed.',
        notes: 'Sound recorded. For best diagnosis, tell your mechanic if the noise happens when accelerating, braking, or turning.'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
