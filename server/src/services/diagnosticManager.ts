import { query } from '../db';
import { Vehicle } from '../models';
import { callAI } from './aiClient';

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
    : 'Vehicle without specific make/model';

  const conversationText = messages.map((m) => `${m.role === 'user' ? 'Owner' : 'Assistant'}: ${m.message}`).join('\n');

  return `You are CarRada, an automotive assistant. Based on the following diagnostic session for ${vehicleSummary}, create a concise mechanic summary that the owner can share with a repair shop:

Guidelines:
- Explain what symptoms the owner observed.
- List 2-3 likely potential causes.
- Recommend the immediate next step.
- Keep it concise (under 150 words).

Diagnostic session history:
${conversationText}`;
}

export async function generateDiagnosticSummary(userId: number, sessionId: number) {
  const session = await getDiagnosticSession(userId, sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const messages = await getSessionMessages(userId, sessionId);
  if (!messages.length) {
    return { summary: 'No messages have been recorded in this diagnostic session yet.' };
  }

  const vehicle = session.vehicle_id
    ? (await query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [session.vehicle_id, userId])).rows[0]
    : null;

  const prompt = await buildSummaryPrompt(messages, vehicle);
  const summaryText = await callAI([{ role: 'user', content: prompt }]);

  return { summary: summaryText };
}
