// Safety triggers for immediate roadside hazards where continuing to operate the vehicle is dangerous
const criticalHazards = [
  'fire',
  'smoke coming',
  'visible smoke',
  'burning smell',
  'fuel leak',
  'gas leak',
  'gasoline smell',
  'brake failure',
  'brakes failed',
  'brake pedal to the floor',
  'no brakes',
  'steering failure',
  'cannot steer',
  'steering locked',
  'loss of control',
  'airbag deployed',
  'electrical shock',
  'stalled on highway',
  'shut off on highway',
];

export function classifySafetyIssue(text: string) {
  const normalized = text.toLowerCase();

  // Check critical acute hazards
  const found = criticalHazards.filter((trigger) => normalized.includes(trigger));
  if (found.length > 0) {
    return {
      alert: true,
      issue: found[0],
      message: `Safety Alert: You mentioned "${found[0]}". If you are driving, safely pull over to a secure location away from traffic, activate hazard lights, turn off the engine, and seek immediate roadside or emergency assistance.`
    };
  }

  // Combined engine overheating + steam/smoke
  if (
    /overheat|overheating|engine temperature|hot engine/.test(normalized) &&
    /smoke|steam|boiling/.test(normalized)
  ) {
    return {
      alert: true,
      issue: 'severe engine overheating with steam/smoke',
      message: 'Severe Overheating Alert: Never open the radiator cap while the engine is hot. Safely pull over immediately and turn off the engine to prevent catastrophic engine failure and burn injuries.'
    };
  }

  return {
    alert: false,
    issue: null,
    message: ''
  };
}
