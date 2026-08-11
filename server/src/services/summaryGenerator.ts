import axios from 'axios';
import { CLAUDE_API_KEY } from './config';

const mechanicPrompt = `You are CarRada, a plain-language mechanic translator for new car owners. When given a mechanic note, explain it in simple terms, list likely reasons, assign urgency as one of: 🔴 stop driving / 🟠 get checked soon / 🟡 monitor / 🟢 minor, and provide 2 questions to ask the mechanic. Do not state a diagnosis as certain. Always say a mechanic should confirm.`;

export async function generateMechanicSummary(text: string) {
  const prompt = `${mechanicPrompt}\n\nMechanic note:\n${text}\n\nResponse:`;

  if (!CLAUDE_API_KEY) {
    return {
      explanation: 'Claude API key is not configured. This is a placeholder mechanic summary.',
      urgency: 'unknown',
      questions: ['Set CLAUDE_API_KEY in server/.env to enable this feature.']
    };
  }

  const payload = {
    model: 'claude-3.5-mini',
    prompt,
    max_tokens_to_sample: 320,
    temperature: 0.3,
    top_p: 1
  };

  const response = await axios.post('https://api.anthropic.com/v1/complete', payload, {
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  const textResponse = response.data?.completion?.trim() || 'I could not generate a translation. Please try again.';
  return {
    explanation: textResponse,
    urgency: 'unknown',
    questions: []
  };
}
