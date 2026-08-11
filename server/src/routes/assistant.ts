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

router.post('/chat', async (req, res) => {
  const userId = (req as any).userId;
  const { messages, vehicleId, sessionId } = req.body;
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ message: 'Conversation messages are required.' });
  }

  const textPayload = messages.map((msg: any) => msg.message).join(' ');
  const safety = classifySafetyIssue(textPayload);
  if (safety.alert) {
    return res.status(200).json({ safety, assistant: null });
  }

  const vehicleResult = vehicleId
    ? await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId])
    : null;
  const vehicle = vehicleResult?.rows?.[0] ?? null;

  const userResult = await query('SELECT id, email, name FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  const assistantResponse = await generateAssistantResponse(messages, user, vehicle);

  await query(
    'INSERT INTO conversations (user_id, vehicle_id, diagnostic_session_id, role, message) VALUES ($1, $2, $3, $4, $5)',
    [userId, vehicleId || null, sessionId || null, 'user', textPayload]
  );
  await query(
    'INSERT INTO conversations (user_id, vehicle_id, diagnostic_session_id, role, message) VALUES ($1, $2, $3, $4, $5)',
    [userId, vehicleId || null, sessionId || null, 'assistant', assistantResponse.text]
  );

  res.json({ safety, assistant: assistantResponse });
});

router.post('/translate', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Mechanic note text is required.' });
  }

  const summary = await generateMechanicSummary(text);
  res.json({ summary });
});

router.post('/analyze-warning-light', async (req, res) => {
  const userId = (req as any).userId;
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ message: 'Image data and MIME type are required.' });
  }

  try {
    const analysis = await analyzeWarningLightImage(imageBase64, mimeType);
    
    // Optionally store the image in the database for reference
    if (analysis.identified.length > 0) {
      await query(
        'INSERT INTO uploaded_images (user_id, key, url, type) VALUES ($1, $2, $3, $4)',
        [userId, `warning-light-${Date.now()}`, `data:${mimeType};base64,${imageBase64.substring(0, 50)}...`, 'warning_light']
      );
    }

    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ message: 'Image analysis failed', detail: error.message });
  }
});

router.post('/cost-estimate', async (req, res) => {
  const userId = (req as any).userId;
  const { description, vehicleId } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ message: 'Repair description is required.' });
  }

  const vehicle = vehicleId
    ? (await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId])).rows[0]
    : null;

  try {
    const estimate = await generateRepairCostEstimate(description, vehicle);
    res.json(estimate);
  } catch (error: any) {
    res.status(500).json({ message: 'Cost estimate generation failed.', detail: error.message });
  }
});

export default router;
