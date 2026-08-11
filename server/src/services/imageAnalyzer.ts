import axios from 'axios';
import { CLAUDE_API_KEY } from './config';

export interface WarningLightAnalysis {
  identified: string[];
  confidence: string;
  meaning: string;
  urgency: string;
  recommendation: string;
  uncertainty?: string;
}

export async function analyzeWarningLightImage(imageData: string, imageMimeType: string): Promise<WarningLightAnalysis> {
  if (!CLAUDE_API_KEY) {
    return {
      identified: [],
      confidence: 'Unable to analyze',
      meaning: 'Claude API key is not configured on the server.',
      urgency: 'N/A',
      recommendation: 'Please set CLAUDE_API_KEY in server/.env',
      uncertainty: 'No API key available'
    };
  }

  const prompt = `You are CarRada, a car assistant. A user has sent you a photo of their car's dashboard warning lights. Your job is to:
1. Identify any visible warning lights or indicators
2. Explain what each light means in plain English
3. Provide urgency guidance (🔴 stop immediately, 🟠 see mechanic soon, 🟡 monitor, 🟢 minor)
4. Give a safe next action

If you cannot clearly see any warning lights, say so and ask for a clearer photo.

Respond with JSON in this exact format:
{
  "identified": ["light name 1", "light name 2"],
  "confidence": "high/medium/low",
  "meaning": "Plain English explanation of what each light means",
  "urgency": "🔴/🟠/🟡/🟢 with brief explanation",
  "recommendation": "What the owner should do next",
  "uncertainty": "Any uncertainty or quality issues with the photo"
}`;

  try {
    const payload = {
      model: 'claude-3.5-sonnet',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageMimeType,
                data: imageData
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    };

    const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.content?.[0]?.text || '';
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        identified: parsed.identified || [],
        confidence: parsed.confidence || 'unknown',
        meaning: parsed.meaning || 'Unable to determine',
        urgency: parsed.urgency || '🟡 Unknown',
        recommendation: parsed.recommendation || 'Consult a mechanic',
        uncertainty: parsed.uncertainty
      };
    }

    return {
      identified: [],
      confidence: 'error',
      meaning: 'Could not parse response from AI model',
      urgency: '🟡',
      recommendation: 'Please try uploading a clearer photo',
      uncertainty: 'AI response format was unexpected'
    };
  } catch (error: any) {
    console.error('Image analysis error:', error.message);
    return {
      identified: [],
      confidence: 'error',
      meaning: 'Failed to analyze image',
      urgency: '🟡',
      recommendation: 'Please try again or describe the lights verbally',
      uncertainty: error.message
    };
  }
}
