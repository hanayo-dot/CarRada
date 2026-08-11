import axios from 'axios';
import { ConversationMessage, User, Vehicle } from '../models';
import { CLAUDE_API_KEY } from './config';

const safetyHeader = `You are CarRada, a safety-first assistant for new car owners. Do not give definitive diagnoses. Use plain English. Always mention "likely" or "possible" and recommend a mechanic for confirmation.`;

export function buildAssistantPrompt(messages: ConversationMessage[], user: User, vehicle: Vehicle | null) {
  const vehicleInfo = vehicle
    ? `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}. Engine: ${vehicle.engine || 'unknown'}. Fuel: ${vehicle.fuel_type || 'unknown'}. Transmission: ${vehicle.transmission || 'unknown'}. Mileage: ${vehicle.mileage ?? 'unknown'}.`
    : 'Vehicle: no specific vehicle selected.';

  const context = [
    safetyHeader,
    'User context: keep language simple and avoid tech jargon.',
    vehicleInfo,
    'If a warning light or symptom is described, ask clarifying questions and rank possible causes. For sounds, ask where it comes from, when it happens, and what it sounds like. Provide urgency as one of: 🔴 stop driving / 🟠 get checked soon / 🟡 monitor / 🟢 minor.',
    'Always include a short copyable mechanic summary at the end.'
  ].join('\n\n');

  const promptMessages = messages.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.message}`).join('\n\n');

  return `${context}\n\n${promptMessages}\n\nAssistant:`;
}

export async function generateAssistantResponse(messages: ConversationMessage[], user: User, vehicle: Vehicle | null) {
  const prompt = buildAssistantPrompt(messages, user, vehicle);

  if (!CLAUDE_API_KEY) {
    return {
      text: 'Claude API key not configured. This is a placeholder response for the AI Car Assistant. Please set CLAUDE_API_KEY in server/.env to activate the real assistant.',
      summary: 'Placeholder response generated because Claude API is not configured.'
    };
  }

  const payload = {
    model: 'claude-3.5-mini',
    prompt,
    max_tokens_to_sample: 450,
    temperature: 0.4,
    top_p: 1
  };

  const response = await axios.post('https://api.anthropic.com/v1/complete', payload, {
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  const text = response.data?.completion?.trim() || 'I could not generate a response. Please try again.';
  return {
    text,
    summary: text.split('\n').slice(-3).join(' ')
  };
}
