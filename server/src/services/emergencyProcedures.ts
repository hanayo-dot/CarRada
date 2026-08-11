import { EmergencyProcedure } from '../models';

const procedures: EmergencyProcedure[] = [
  {
    slug: 'wont-start',
    title: 'Car won\'t start',
    summary: 'A simple checklist to help safely narrow down why the car is not starting.',
    safety_tips: 'If you smell fuel, see smoke, or hear unusual grinding, do not attempt to crank repeatedly. Stay clear of moving traffic.',
    steps: [
      { title: 'Check power', description: 'Verify the dashboard lights and headlights come on when the key is turned or the start button is pressed.' },
      { title: 'Try a restart', description: 'If the dash is dead, try another key or hold the brake and start button again. If the car still does not respond, the battery may be low.' },
      { title: 'Inspect battery terminals', description: 'Look for corrosion or loose clamps. If safe, clean and tighten them before trying again.' },
      { title: 'Call for help', description: 'If the battery is visibly dead or the starter makes a clicking sound, call roadside assistance or a tow truck.' }
    ]
  },
  {
    slug: 'overheating',
    title: 'Engine overheating',
    summary: 'Steps to safely respond if the engine runs hot or the temperature gauge spikes.',
    safety_tips: 'Stop driving immediately if the temperature warning is on. Never open the radiator cap while the engine is hot. Risk of severe burns.',
    steps: [
      { title: 'Pull over safely', description: 'Find a safe spot away from traffic and turn off the engine. Use hazard lights.' },
      { title: 'Look for leaks', description: 'Check under the hood and under the car for coolant or steam. If you see a leak, keep your distance and do not touch.' },
      { title: 'Let it cool', description: 'Wait 15–30 minutes for the engine to cool before any further checks. Do not pressurize the cooling system.' },
      { title: 'Add coolant or water', description: 'Once cool, you can add coolant or water to the overflow tank (not the radiator cap). Do not overfill.' },
      { title: 'Monitor temperature', description: 'Restart and drive slowly to a mechanic. Keep the temperature gauge in view. If it spikes again, pull over immediately.' }
    ]
  },
  {
    slug: 'flat-tire',
    title: 'Flat tire',
    summary: 'Guide through a safe flat tire inspection and basic tire change preparation.',
    safety_tips: 'Park on firm, level ground away from traffic. Use hazard lights and wheel chocks if available. Never change a tire on a highway shoulder or in moving traffic.',
    steps: [
      { title: 'Secure the car', description: 'Turn on hazard lights, apply the parking brake, and place safety triangles or flares if you have them.' },
      { title: 'Inspect the tire', description: 'Look for nails, cuts, or a visibly collapsed sidewall. Do not attempt to repair a sidewall puncture.' },
      { title: 'Prepare to change', description: 'Gather the jack, lug wrench, and spare tire. Make sure the spare has air.' },
      { title: 'Raise the car', description: 'Place the jack under the frame (not the plastic) and raise just enough to lift the wheel off the ground.' },
      { title: 'Remove the old tire', description: 'Use the wrench to loosen lug nuts, remove them fully, and pull the tire straight toward you.' },
      { title: 'Install the spare', description: 'Align the spare and push it onto the studs. Reinstall lug nuts by hand, then lower the car and tighten with the wrench.' },
      { title: 'Drive carefully', description: 'Most spares are temporary. Drive slowly to a tire shop to repair or replace the damaged tire.' }
    ]
  },
  {
    slug: 'dead-battery',
    title: 'Dead battery (jump-start)',
    summary: 'How to safely jump-start a car with a dead battery.',
    safety_tips: 'Wear safety glasses. Do not touch corroded battery terminals. Never jump-start if the battery is cracked, leaking, or swollen. Remove metal jewelry.',
    steps: [
      { title: 'Get jumper cables', description: 'Borrow jumper cables and find another car with a working battery. Position both cars close but not touching.' },
      { title: 'Turn off both cars', description: 'Make sure both ignition are off before connecting cables. This prevents electrical damage.' },
      { title: 'Connect red cable to dead battery', description: 'Attach the red clamp to the positive terminal (+) of your dead battery, then to the positive terminal of the working battery.' },
      { title: 'Connect black cable', description: 'Attach the black clamp to the negative terminal (-) of the working battery, then to a clean metal surface on your engine (not the negative terminal).' },
      { title: 'Start the working car', description: 'Let it run for a minute or two, then attempt to start your car.' },
      { title: 'Remove cables', description: 'Once running, remove cables in reverse order: black from your car, black from helper car, red from helper, red from your car.' },
      { title: 'Keep running', description: 'Drive for at least 20 minutes to recharge the battery. If the car dies again, the battery or alternator may be faulty.' }
    ]
  },
  {
    slug: 'locked-out',
    title: 'Locked out of car',
    summary: 'What to do if you are locked out and cannot access your car.',
    safety_tips: 'Do not attempt to break windows or pick locks unless it is an emergency with a child or pet in the car. Never try to hotwire your vehicle.',
    steps: [
      { title: 'Check all doors', description: 'Sometimes one door is unlocked. Try all doors, the tailgate, and windows.' },
      { title: 'Look for a spare key', description: 'Call a family member or friend who has a spare key. If they can reach you quickly, this is the fastest option.' },
      { title: 'Call roadside assistance', description: 'If you have roadside assistance (AAA, insurance, manufacturer), call them. They send a locksmith to unlock your car without damage.' },
      { title: 'Contact a locksmith', description: 'A professional automotive locksmith can unlock your car. This costs $50–150 typically. Avoid choosing randomly; ask for recommendations.' },
      { title: 'Contact the car manufacturer', description: 'Some brands offer roadside unlock services. Check your manual or call the dealership number on your key fob or documentation.' },
      { title: 'Prevent future lockouts', description: 'Hide a spare key in a secure magnetic box under the car, give one to a trusted friend, or use a keypad/keyless entry system.' }
    ]
  },
  {
    slug: 'smoke-burning-smell',
    title: 'Smoke or burning smell',
    summary: 'How to respond if you see smoke or smell burning coming from your car.',
    safety_tips: 'This is a potential fire risk. Stop driving immediately and evacuate to a safe distance. Do not attempt repairs. Call emergency services if smoke is heavy or flames are visible.',
    steps: [
      { title: 'Stop and pull over', description: 'Turn off the engine, turn on hazard lights, and move away from traffic. If near a highway, get at least 100 feet away.' },
      { title: 'Evacuate the car', description: 'Exit the vehicle and move passengers to safety, away from the car. Do not return to the vehicle.' },
      { title: 'Identify the source', description: 'From a safe distance, try to identify where the smoke is coming from (engine, wheel, undercarriage, interior). Do not open the hood if smoke is coming from it.' },
      { title: 'Call for help', description: 'Call emergency services (911) immediately if you see flames, heavy smoke, or smell burning plastic. Call roadside assistance or a tow truck otherwise.' },
      { title: 'Do not use the car', description: 'Even if the smoke stops, do not drive the car. Have it towed to a mechanic for inspection. Smoke often indicates a serious electrical or engine issue.' },
      { title: 'Document for insurance', description: 'Take photos and note the date, time, and location for your insurance claim if needed.' }
    ]
  },
  {
    slug: 'fluid-leak',
    title: 'Fluid leak under car',
    summary: 'How to identify and respond to fluid leaks from under your vehicle.',
    safety_tips: 'Do not touch hot oil or coolant. Do not drive if there is a large pool of fluid or if the car is losing fluid visibly while driving.',
    steps: [
      { title: 'Check the parking spot', description: 'Look at where the car was parked. Do you see a puddle? Note the color, smell, and location under the car.' },
      { title: 'Identify the fluid type', description: 'Red/pink: transmission fluid. Dark brown: engine oil. Bright green/orange: coolant. Clear: water (usually A/C condensation—normal). Purple/blue: brake fluid.' },
      { title: 'Check fluid levels', description: 'Pop the hood and check the oil dipstick, coolant overflow tank, and transmission dipstick (if accessible). Top off if low, but do not overfill.' },
      { title: 'Assess urgency', description: 'Brake fluid or transmission fluid leaks are serious—do not drive. Engine oil leaks are less urgent but should be checked soon. Coolant leaks can lead to overheating.' },
      { title: 'Drive to a mechanic', description: 'If the leak is minor and fluid levels are okay, you can often drive carefully to a nearby mechanic. Bring the puddle photo if available.' },
      { title: 'Get it inspected', description: 'A mechanic will identify the source and repair it. Continued leaking can damage the engine or cause unsafe conditions.' }
    ]
  },
  {
    slug: 'minor-accident',
    title: 'Minor accident or light collision',
    summary: 'Steps to take after a minor accident or light impact with another vehicle or object.',
    safety_tips: 'If anyone is injured, call emergency services first. Never leave the scene without exchanging information. If vehicles are in traffic, move to a safe location.',
    steps: [
      { title: 'Check for injuries', description: 'Ask your passengers if anyone is hurt. If yes, call emergency services (911). If no injuries, proceed.' },
      { title: 'Turn off engine', description: 'Turn off your car to prevent fire risk. Use hazard lights.' },
      { title: 'Move to safety', description: 'If safe and both cars are drivable, move to a parking lot or side street away from traffic.' },
      { title: 'Exchange information', description: 'Get the other driver\'s name, phone number, address, insurance company, policy number, and license plate. Take a photo of their license.' },
      { title: 'Document the scene', description: 'Take photos of both vehicles, the damage, the accident location, street signs, and weather conditions. Note the date, time, and exact location.' },
      { title: 'Report to insurance', description: 'Call your insurance company and report the accident, even if damage is minor. Provide the other driver\'s information and your photos.' },
      { title: 'Get a mechanic inspection', description: 'Have a mechanic check for hidden damage to the frame or mechanical systems. Do not assume minor surface damage means the car is safe to drive.' },
      { title: 'Keep records', description: 'Save all photos, insurance correspondence, and repair estimates. These may be needed for claims.' }
    ]
  },
  {
    slug: 'check-engine-light',
    title: 'Check engine light on',
    summary: 'What to do if the check engine warning light appears on your dashboard.',
    safety_tips: 'A check engine light does not always mean stop immediately, but it should never be ignored. If the light is flashing (not solid), stop driving and get a tow.',
    steps: [
      { title: 'Assess the light type', description: 'A solid yellow/amber light indicates a non-urgent issue. A flashing red/orange light indicates a serious engine problem—stop driving and call a tow truck.' },
      { title: 'Check for obvious issues', description: 'Ensure your fuel cap is tight (a loose cap can trigger the light). Check the temperature gauge and listen for unusual sounds.' },
      { title: 'Plan a diagnostic', description: 'The light requires a diagnostic scan with a code reader to identify the issue. You can get this done at a mechanic or auto parts store.' },
      { title: 'Continue with caution', description: 'If the light is solid and the car feels normal, you can usually drive carefully to a mechanic. Avoid high speeds or towing.' },
      { title: 'Get the scan', description: 'A mechanic will plug in a scanner and retrieve the fault code. Common codes indicate issues like a faulty oxygen sensor, catalytic converter, or bad spark plugs.' },
      { title: 'Make the repair', description: 'Once the issue is identified, discuss the repair with your mechanic. Do not ignore the light long-term; some issues can damage the engine if left untreated.' },
      { title: 'Monitor after repair', description: 'If the light reappears, go back to the mechanic. The repair may not have addressed the root cause.' }
    ]
  },
  {
    slug: 'brake-warning-light',
    title: 'Brake warning light or brake failure',
    summary: 'How to respond if the brake warning light appears or brakes feel soft.',
    safety_tips: 'Brake issues are serious. If brakes fade, feel spongy, or fail, treat it as an emergency. Do not drive on a highway. Stop immediately and get help.',
    steps: [
      { title: 'Identify the warning', description: 'A solid red brake light (not ABS) indicates low brake fluid or a brake system failure. A yellow ABS light indicates an anti-lock brake system issue.' },
      { title: 'Check brake fluid', description: 'Pop the hood and look for the brake master cylinder. If the fluid level is very low, that is the problem—low fluid reduces brake pressure.' },
      { title: 'Test brake response', description: 'Gently press the brake pedal. It should be firm. If it feels soft, spongy, or goes to the floor, the brakes may be failing.' },
      { title: 'Pump the brakes', description: 'If the pedal feels soft, you can try pumping the brakes several times to restore pressure (only a temporary fix).' },
      { title: 'Drive slowly to a mechanic', description: 'If brakes still respond, drive slowly to a nearby mechanic. Avoid highways and high speeds. Do not tailgate.' },
      { title: 'Do not ignore the light', description: 'Brake system issues can lead to complete brake failure. Get this inspected immediately. Do not drive the car normally until it is fixed.' },
      { title: 'Get a full brake inspection', description: 'The mechanic will check brake pads, rotors, brake lines, and fluid. Common fixes include topping off fluid, replacing pads, or bleeding the system.' }
    ]
  }
];

export function getEmergencyList() {
  return procedures.map((procedure) => ({
    slug: procedure.slug,
    title: procedure.title,
    summary: procedure.summary,
    safety_tips: procedure.safety_tips
  }));
}

export function getEmergencyProcedure(slug: string) {
  return procedures.find((procedure) => procedure.slug === slug) || null;
}
