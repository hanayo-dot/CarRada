import { callVisionAI } from './aiClient';

export interface WarningLightAnalysis {
  identified: string[];
  confidence: string;
  meaning: string;
  urgency: string;
  recommendation: string;
  uncertainty?: string;
}

export async function analyzeWarningLightImage(imageData: string, imageMimeType: string): Promise<WarningLightAnalysis> {
  const prompt = `You are CarRada, an expert automotive assistant for new car owners. A driver uploaded a dashboard warning light photo.
Analyze the image and return a JSON object with this exact structure:
{
  "identified": ["List of identified dashboard warning light names or indicators"],
  "confidence": "high" | "medium" | "low",
  "meaning": "Plain-English explanation of what each warning light means, written for someone who knows nothing about cars.",
  "urgency": "🔴 Stop immediately | 🟠 See mechanic soon | 🟡 Monitor | 🟢 Normal indicator",
  "recommendation": "Clear, practical, and safe next step for the owner.",
  "uncertainty": "Note any blurriness or glare if present, otherwise empty"
}
Ensure your output is strictly valid JSON without Markdown fences.`;

  try {
    const rawResponse = await callVisionAI(imageData, imageMimeType, prompt);

    // Extract JSON from response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        identified: Array.isArray(parsed.identified) ? parsed.identified : [],
        confidence: parsed.confidence || 'medium',
        meaning: parsed.meaning || 'Warning light identified on dashboard.',
        urgency: parsed.urgency || '🟠 See mechanic soon',
        recommendation: parsed.recommendation || 'Consult a certified mechanic to inspect the system.',
        uncertainty: parsed.uncertainty || undefined,
      };
    }

    return {
      identified: ['Dashboard indicator'],
      confidence: 'low',
      meaning: rawResponse.slice(0, 300),
      urgency: '🟠 Get checked soon',
      recommendation: 'Have an auto technician read the diagnostic trouble code (OBD-II).',
      uncertainty: 'Could not parse structured response from image analysis.',
    };
  } catch (error: any) {
    console.error('[ImageAnalyzer] Error:', error.message);
    throw error;
  }
}
