import { callAI } from './aiClient';

export interface MechanicTranslation {
  explanation: string;
  urgency: string;
  questions: string[];
}

export async function generateMechanicSummary(text: string): Promise<MechanicTranslation> {
  const prompt = `You are CarRada, an expert automotive translator for new car owners.
Translate the following mechanic note or invoice text into plain, non-intimidating English:
"${text}"

Respond with ONLY valid JSON with this exact schema:
{
  "explanation": "Clear, friendly paragraph explaining what parts or labor the mechanic is describing, why it matters, and whether it represents normal wear and tear.",
  "urgency": "🔴 Stop driving immediately | 🟠 Repair soon | 🟡 Monitor | 🟢 Optional maintenance",
  "questions": [
    "Specific question 1 the owner should ask the mechanic before agreeing to work",
    "Specific question 2 (e.g. asking to see the worn part, inquiring about aftermarket vs OEM parts, or warranty)"
  ]
}`;

  try {
    const rawResponse = await callAI([{ role: 'user', content: prompt }]);
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        explanation: parsed.explanation || rawResponse,
        urgency: parsed.urgency || '🟠 Repair soon',
        questions: Array.isArray(parsed.questions) && parsed.questions.length ? parsed.questions : [
          'Can you show me the worn component before replacing it?',
          'Is this repair urgent, or can it safely wait until my next service?'
        ]
      };
    }

    return {
      explanation: rawResponse,
      urgency: '🟠 Repair soon',
      questions: [
        'Can you show me where the issue is on the vehicle?',
        'Does this price quote include parts, labor, and disposal fees?'
      ]
    };
  } catch (error: any) {
    console.error('[MechanicTranslator] Error:', error.message);
    throw error;
  }
}
