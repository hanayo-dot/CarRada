import { callAI } from './aiClient';

export interface RepairCostEstimateResult {
  estimate: string;
  explanation: string;
  detail: string;
  partsRange?: string;
  laborRange?: string;
}

export async function generateRepairCostEstimate(
  description: string,
  vehicle: any | null
): Promise<RepairCostEstimateResult> {
  const vehicleInfo = vehicle
    ? `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}. Mileage: ${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' miles' : 'unknown'}.`
    : 'Vehicle: General vehicle (no make/model specified).';

  const prompt = `You are CarRada, an automotive cost estimation assistant for new car owners.
Estimate the realistic repair cost range for the following issue:
${vehicleInfo}
Problem description: "${description}"

Provide your estimate as JSON with this exact format:
{
  "estimate": "$150 - $350 (Example realistic total range in USD)",
  "partsRange": "$50 - $150 (Typical parts cost)",
  "laborRange": "$100 - $200 (1 - 2 hours typical labor)",
  "explanation": "Brief explanation of what components typically get replaced and factors that influence the price (independent shop vs dealership).",
  "detail": "Practical recommendation for a new car owner (e.g. asking for an itemized estimate, checking for warranty coverage)."
}`;

  try {
    const rawResponse = await callAI([{ role: 'user', content: prompt }]);
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        estimate: parsed.estimate || '$100 - $300',
        explanation: parsed.explanation || rawResponse,
        detail: parsed.detail || 'Always request an itemized estimate before approving repairs.',
        partsRange: parsed.partsRange,
        laborRange: parsed.laborRange,
      };
    }

    const firstLine = rawResponse.split('\n')[0] || '$100 - $300';
    return {
      estimate: firstLine,
      explanation: rawResponse,
      detail: rawResponse,
    };
  } catch (error: any) {
    console.error('[CostEstimator] Error:', error.message);
    throw error;
  }
}
