import { query } from '../db';
import { User, Vehicle } from '../models';
import axios from 'axios';
import { CLAUDE_API_KEY } from './config';

export async function createDiagnosticSession(userId: number, vehicleId: number | null, sessionName: string) {
  const result = await query(
    'INSERT INTO diagnostic_sessions (user_id, vehicle_id, session_name) VALUES ($1, $2, $3) RETURNING *',
    [userId, vehicleId, sessionName]
  );
  return result.rows[0];
}

export async function listDiagnosticSessions(userId: number) {
  const result = await query(
    `SELECT ds.id, ds.session_name, ds.status, ds.created_at, ds.updated_at, v.make, v.model, v.year
     FROM diagnostic_sessions ds
     LEFT JOIN vehicles v ON ds.vehicle_id = v.id
     WHERE ds.user_id = $1
     ORDER BY ds.updated_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getDiagnosticSession(userId: number, sessionId: number) {
  const result = await query(
    'SELECT * FROM diagnostic_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );
  return result.rows[0] || null;
}

export async function getSessionMessages(userId: number, sessionId: number) {
  const result = await query(
    'SELECT role, message, created_at FROM conversations WHERE user_id = $1 AND diagnostic_session_id = $2 ORDER BY created_at ASC',
    [userId, sessionId]
  );
  return result.rows;
}

async function buildSummaryPrompt(messages: { role: string; message: string }[], vehicle: Vehicle | null) {
  const vehicleSummary = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    : 'Unknown vehicle';

  const conversationText = messages.map((m) => `${m.role === 'user' ? 'Owner' : 'Assistant'}: ${m.message}`).join('\n');

  return `You are CarRada, a safety-first car assistant. Based on the following diagnostic session for ${vehicleSummary}, create a concise mechanic summary that the owner can copy and share.

Guidelines:
- Use plain English.
- Do not claim certainty.
- Include what the owner observed, likely causes, urgency, and next step recommendations.
- Keep it short and shareable.

Diagnostic session:
${conversationText}

Mechanic summary:`;
}

export async function generateDiagnosticSummary(userId: number, sessionId: number) {
  const session = await getDiagnosticSession(userId, sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const messages = await getSessionMessages(userId, sessionId);
  const vehicle = session.vehicle_id
    ? (await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [session.vehicle_id, userId])).rows[0]
    : null;

  const prompt = await buildSummaryPrompt(messages, vehicle);
  if (!CLAUDE_API_KEY) {
    return { summary: 'Claude API key not configured. Set CLAUDE_API_KEY in server/.env to generate summaries.' };
  }

  const payload = {
    model: 'claude-3.5-mini',
    prompt,
    max_tokens_to_sample: 300,
    temperature: 0.3,
    top_p: 1
  };

  const response = await axios.post('https://api.anthropic.com/v1/complete', payload, {
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return { summary: response.data?.completion?.trim() || 'Unable to generate summary.' };
}
