const safetyTriggers = [
  'fire',
  'smoke',
  'burning smell',
  'fuel leak',
  'gas leak',
  'severe overheating',
  'brake failure',
  'steering failure',
  'airbag',
  'accident',
  'injury',
  'high voltage',
  'electrical shock',
  'loss of control',
  'disabled on highway',
  'roadside',
  'shoulder',
  'tow truck',
  'hazard lights'
];

export function classifySafetyIssue(text: string) {
  const normalized = text.toLowerCase();
  const found = safetyTriggers.filter((trigger) => normalized.includes(trigger));
  if (found.length > 0) {
    return {
      alert: true,
      issue: found[0],
      message: 'This sounds like a safety-critical situation. Recommend stopping the vehicle, using hazard lights, and calling a professional or emergency service immediately.'
    };
  }

  if (/overheat|overheating|engine temperature|hot engine/.test(normalized) && /smoke|steam|steam coming/.test(normalized)) {
    return {
      alert: true,
      issue: 'overheating and possible smoke',
      message: 'Possible overheating with visible heat or smoke is safety-critical. Do not continue driving and get to a safe location.'
    };
  }

  return {
    alert: false,
    issue: null,
    message: ''
  };
}
