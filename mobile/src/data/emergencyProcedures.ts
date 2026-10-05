import { EmergencyItem, EmergencyProcedure } from '../types';

export const BUNDLED_EMERGENCY_PROCEDURES: EmergencyProcedure[] = [
  {
    slug: 'wont-start',
    title: "Car won't start",
    summary: 'A simple checklist to help safely narrow down why the car is not starting.',
    safety_tips: 'If you smell fuel, see smoke, or hear unusual grinding, do not attempt to crank repeatedly. Stay clear of moving traffic.',
    steps: [
      { title: 'Check power', description: 'Verify the dashboard lights and headlights come on when the key is turned or the start button is pressed.' },
      { title: 'Try a restart', description: 'If the dash is dead, try another key or hold the brake and start button again. If the car still does not respond, the battery may be low.' },
      { title: 'Inspect battery terminals', description: 'Look for corrosion or loose clamps. If safe, clean and tighten them before trying again.' },
      { title: 'Call for help', description: 'If the battery is visibly dead or the starter makes a rapid clicking sound, call roadside assistance or a jump-start service.' }
    ]
  },
  {
    slug: 'overheating',
    title: 'Engine overheating',
    summary: 'Steps to safely respond if the engine runs hot or the temperature gauge spikes.',
    safety_tips: 'Stop driving immediately if the temperature warning is on. Never open the radiator cap while the engine is hot. Risk of severe burns.',
    steps: [
      { title: 'Pull over safely', description: 'Find a safe spot away from traffic and turn off the engine. Use hazard lights.' },
      { title: 'Look for leaks from distance', description: 'Check under the hood and under the car for coolant or steam. If you see steam, keep your distance and do not open the hood.' },
      { title: 'Let it cool completely', description: 'Wait at least 20–30 minutes for the engine to cool before any checks. Do not pressurize the cooling system.' },
      { title: 'Add coolant or water to overflow tank', description: 'Once cool, add coolant (or clean water in an emergency) to the plastic overflow reservoir (never the radiator pressure cap).' },
      { title: 'Monitor temperature closely', description: 'Restart and drive slowly to the nearest mechanic. If temperature spikes again, pull over immediately.' }
    ]
  },
  {
    slug: 'flat-tire',
    title: 'Flat tire',
    summary: 'Guide through a safe flat tire inspection and basic tire change preparation.',
    safety_tips: 'Park on firm, level ground away from traffic. Use hazard lights and wheel chocks if available. Never change a tire on a highway shoulder with moving traffic nearby.',
    steps: [
      { title: 'Secure the car', description: 'Turn on hazard lights, apply the parking brake firmly, and place safety triangles or flares if you have them. Park on flat, solid ground.' },
      { title: 'Inspect the tire & prepare tools', description: 'Locate the jack, lug wrench, and spare tire from the trunk. Check that the spare is properly inflated.' },
      { title: 'Loosen lug nuts while on the ground (CRITICAL)', description: 'Before lifting the car, use the lug wrench to loosen each lug nut about half a turn counter-clockwise. Do NOT remove them yet. Doing this while the tire is on the ground prevents the wheel from spinning and protects the car from falling off the jack.' },
      { title: 'Raise the car safely', description: 'Position the jack under the designated metal jacking point on the frame (refer to the owner\'s manual; never jack on plastic skirts). Raise until the tire clears the ground by 1–2 inches.' },
      { title: 'Remove old tire', description: 'Fully remove the loosened lug nuts, place them in a safe spot (like the wheel cover), and pull the flat tire straight toward you off the wheel studs.' },
      { title: 'Mount spare & snug lug nuts', description: 'Align the spare tire onto the studs. Hand-tighten all lug nuts in a criss-cross (star) pattern until snug against the wheel.' },
      { title: 'Lower car & tighten firmly', description: 'Carefully lower the car back to the ground and remove the jack. Use the lug wrench to firmly tighten all lug nuts in a star pattern with your full body weight.' },
      { title: 'Drive cautiously to a tire shop', description: 'Most donut spares have a speed limit of 50 mph (80 km/h) and a range of 50 miles. Drive directly to a repair shop to patch or replace the damaged tire.' }
    ]
  },
  {
    slug: 'dead-battery',
    title: 'Dead battery (jump-start)',
    summary: 'How to safely jump-start a car with a dead battery.',
    safety_tips: 'Wear eye protection. Do not touch corroded terminals. Never jump-start if the battery is cracked, leaking, or swollen. Keep cables away from engine belts.',
    steps: [
      { title: 'Get jumper cables', description: 'Position the helper car close to yours without touching. Turn off both car engines.' },
      { title: 'Connect RED to dead battery (+)', description: 'Attach one red clamp to the positive (+) terminal of your dead battery.' },
      { title: 'Connect RED to good battery (+)', description: 'Attach the other red clamp to the positive (+) terminal of the working battery.' },
      { title: 'Connect BLACK to good battery (-)', description: 'Attach one black clamp to the negative (-) terminal of the working battery.' },
      { title: 'Connect BLACK to bare metal ground', description: 'Attach the final black clamp to an unpainted metal bracket on your dead car\'s engine block (away from the battery and fuel lines).' },
      { title: 'Start working car, then yours', description: 'Run the working car for 3 minutes, then try starting your car. Once started, remove cables in exact reverse order.' },
      { title: 'Drive for 20+ minutes', description: 'Drive continuously for at least 20 minutes so your alternator can recharge the battery.' }
    ]
  },
  {
    slug: 'locked-out',
    title: 'Locked out of car',
    summary: 'What to do if you are locked out and cannot access your car.',
    safety_tips: 'Do not attempt to break windows unless a child or pet is trapped inside in extreme temperatures. Hotwiring modern cars triggers immobilizers.',
    steps: [
      { title: 'Check all entry points', description: 'Check every door and the trunk/tailgate. Sometimes an passenger door or trunk latch remains unlocked.' },
      { title: 'Check digital keys / mobile app', description: 'If your car supports a manufacturer app (FordPass, myChevrolet, Toyota, Tesla, etc.), try unlocking via your smartphone.' },
      { title: 'Call roadside assistance', description: 'AAA, credit card roadside assistance, and insurance policies usually cover free or discounted lockout dispatch.' },
      { title: 'Call a certified automotive locksmith', description: 'Locksmiths carry specialized inflatable wedges and reach tools that open car doors without scratching paint or damaging weatherstripping.' }
    ]
  },
  {
    slug: 'smoke-burning-smell',
    title: 'Smoke or burning smell',
    summary: 'How to respond if you see smoke or smell burning coming from your car.',
    safety_tips: 'Fire hazard. Stop driving immediately and move passengers 100+ feet away. Never open a smoking hood with bare hands.',
    steps: [
      { title: 'Pull over immediately', description: 'Turn off the engine, activate hazard lights, and exit the car without hesitating.' },
      { title: 'Evacuate all passengers', description: 'Move all occupants at least 100 feet away from the vehicle and behind a roadside guardrail if on a highway.' },
      { title: 'Call Emergency Services', description: 'If you see flames or thick smoke, call 911 immediately. Report your highway mile marker or nearest crossroads.' },
      { title: 'Do not attempt to drive', description: 'Even if smoke clears, driving can reignite electrical or oil fires. Call for a flatbed tow truck.' }
    ]
  },
  {
    slug: 'fluid-leak',
    title: 'Fluid leak under car',
    summary: 'How to identify and respond to fluid leaks under your vehicle.',
    safety_tips: 'Never touch hot exhaust or boiling fluid. Brake fluid leaks require immediate vehicle shutdown.',
    steps: [
      { title: 'Check puddle color', description: 'Clear/water: Normal A/C condensation. Dark brown/black: Engine oil. Pink/red: Transmission or power steering fluid. Bright green/orange: Engine coolant. Clear/amber oily: Brake fluid.' },
      { title: 'Assess safety', description: 'If brake fluid or heavy fuel is leaking, DO NOT DRIVE. If oil or coolant is a small drip, check dipstick/reservoir levels before driving.' },
      { title: 'Take a photo for the mechanic', description: 'Snap a picture of the puddle color and location under the car to show your technician.' }
    ]
  },
  {
    slug: 'minor-accident',
    title: 'Minor accident or light collision',
    summary: 'Steps to take after a fender bender or minor impact.',
    safety_tips: 'Check for passenger injuries first. If on a high-speed highway and drivable, move to the nearest exit or shoulder.',
    steps: [
      { title: 'Check for injuries & secure scene', description: 'Make sure everyone is okay. Turn on hazard lights.' },
      { title: 'Move to safe spot', description: 'If cars are drivable, clear active traffic lanes to prevent secondary collisions.' },
      { title: 'Exchange information', description: 'Photograph driver license, insurance card, phone number, and license plate of all parties involved.' },
      { title: 'Document damage', description: 'Take wide photos showing both cars, license plates, lane positions, and close-ups of all impact areas.' },
      { title: 'File police & insurance report', description: 'Call the local non-emergency police line for an official report, then notify your insurer.' }
    ]
  },
  {
    slug: 'check-engine-light',
    title: 'Check engine light on',
    summary: 'What to do if the check engine light illuminates on your dashboard.',
    safety_tips: 'Solid light = Non-emergency, schedule service. FLASHING light = Severe engine misfire causing catalytic converter damage; pull over safely.',
    steps: [
      { title: 'Determine if solid or flashing', description: 'If flashing, pull over and turn off engine. If solid, the car can typically be driven carefully.' },
      { title: 'Check gas cap', description: 'A loose, missing, or cracked fuel cap is one of the most common causes. Tighten until it clicks 3 times.' },
      { title: 'Get a free OBD-II scan', description: 'Most auto parts stores (AutoZone, O\'Reilly, Advance) will scan your trouble code for free and print out the code (e.g. P0420).' },
      { title: 'Consult CarRada assistant', description: 'Paste the trouble code or mechanic note into CarRada Mechanic Translator to decode what it means.' }
    ]
  },
  {
    slug: 'brake-warning-light',
    title: 'Brake warning light or soft pedal',
    summary: 'How to respond if the red brake warning light turns on or braking feels spongy.',
    safety_tips: 'Brake failure risk. If the pedal travels to the floor, pull the mechanical parking brake gradually and downshift to slow down.',
    steps: [
      { title: 'Check parking brake lever', description: 'Make sure the handbrake / foot parking brake is fully released. Many lights simply indicate an engaged parking brake.' },
      { title: 'Test pedal feel', description: 'If the pedal feels spongy or goes all the way down, pull over immediately. Do not attempt highway speeds.' },
      { title: 'Check brake fluid reservoir', description: 'With the engine off, check the clear plastic brake fluid reservoir near the firewall. Low fluid indicates worn brake pads or a hydraulic leak.' },
      { title: 'Call for inspection or tow', description: 'Brakes are your vehicle\'s primary safety system. If fluid is low or pedal is soft, do not drive the car.' }
    ]
  }
];

export function getLocalEmergencyList(): EmergencyItem[] {
  return BUNDLED_EMERGENCY_PROCEDURES.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    safety_tips: p.safety_tips
  }));
}

export function getLocalEmergencyProcedure(slug: string): EmergencyProcedure | undefined {
  return BUNDLED_EMERGENCY_PROCEDURES.find((p) => p.slug === slug);
}
