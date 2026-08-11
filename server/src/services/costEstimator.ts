import axios from 'axios';
import { CLAUDE_API_KEY } from './config';
import { query } from '../db';

export async function generateRepairCostEstimate(description: string, vehicle: any | null) {
  const vehicleInfo = vehicle
    ? `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}. Mileage: ${vehicle.mileage || 'unknown'}.`
    : 'Vehicle information not provided.';

  const prompt = `You are CarRada, a safety-first car assistant. Based on the repair request below, provide a likely cost range and practical next steps.\n\n${vehicleInfo}\n\nProblem: ${description}\n\nInstructions:\n- Use US dollars as the currency unless the user indicates otherwise.\n- Give a short realistic cost range and a brief explanation of what affects the price.\n- Mention whether the repair is likely simple, moderate, or complex.\n- Recommend the next step for a new car owner.`;

  if (!CLAUDE_API_KEY) {
    return {
      estimate: 'N/A',
      explanation: 'Claude API key is not configured. Set CLAUDE_API_KEY in server/.env to get a live cost estimate.',
      detail: `${vehicleInfo} Problem: ${description}`
    };
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

  const text = response.data?.completion?.trim() || 'Unable to generate an estimate.';
  return {
    estimate: text.split('\n')[0] || 'Estimate unavailable',
    explanation: text,
    detail: text
  };
}
