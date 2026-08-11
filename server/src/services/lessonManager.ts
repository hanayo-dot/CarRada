export type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string[];
  tags: string[];
};

const lessons: Lesson[] = [
  {
    id: 1,
    title: 'How your cooling system works',
    description: 'Learn why coolant, the radiator, and thermostat matter for engine health.',
    content: [
      'The cooling system keeps your engine from overheating by circulating coolant through the engine and radiator.',
      'Check coolant level regularly and look for leaks around hoses or the radiator cap.',
      'If the temperature gauge climbs or you see steam, stop safely and let the engine cool before checking.'
    ],
    tags: ['cooling', 'engine', 'maintenance']
  },
  {
    id: 2,
    title: 'Tire wear and pressure basics',
    description: 'Simple checks to keep your tires safe and efficient.',
    content: [
      'Proper tire pressure improves fuel economy and braking performance.',
      'Inspect tread depth and wear pattern every month; uneven wear can mean alignment or balance issues.',
      'Rotate tires every 5,000–7,000 miles to extend their life.'
    ],
    tags: ['tires', 'safety', 'maintenance']
  },
  {
    id: 3,
    title: 'Understanding dashboard warning lights',
    description: 'Learn which lights need immediate action and which can wait for a checkup.',
    content: [
      'Red lights usually mean stop driving or pull over safely. Orange/yellow lights mean inspect soon.',
      'A check engine light can indicate many issues, from a loose gas cap to engine trouble.',
      'If a light comes on with strange noises or smoke, stop driving and get help.'
    ],
    tags: ['warning lights', 'safety']
  },
  {
    id: 4,
    title: 'When to change engine oil',
    description: 'Oil changes are one of the most important simple maintenance tasks.',
    content: [
      'Your owner’s manual tells you the right oil type and interval for your car.',
      'Dark, dirty oil or a burning smell are signs you may need a change sooner.',
      'Regular oil changes protect engine parts and keep your car running smoothly.'
    ],
    tags: ['oil', 'engine']
  },
  {
    id: 5,
    title: 'Brake system checks every driver should know',
    description: 'Recognize early brake wear and stay safe on the road.',
    content: [
      'Listen for squealing, grinding, or a spongy brake pedal.',
      'Brake fluid should be topped up and changed per the manufacturer’s schedule.',
      'If your car pulls to one side during braking, have the brakes inspected.'
    ],
    tags: ['brakes', 'safety']
  },
  {
    id: 6,
    title: 'Battery health for cold starts',
    description: 'Keep your battery strong with these quick inspections.',
    content: [
      'Check the battery terminals for corrosion and make sure connections are tight.',
      'A weak battery can cause slow engine cranking or trouble starting on cold mornings.',
      'If your battery is older than three years, consider testing it before it fails.'
    ],
    tags: ['battery', 'starting']
  }
];

export function getLessons() {
  return lessons;
}

export function getDailyLesson() {
  const index = Math.floor(Date.now() / 86400000) % lessons.length;
  return lessons[index];
}
