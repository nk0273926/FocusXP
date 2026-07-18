export const MOTIVATIONAL_QUOTES = [
  'Almost there! Keep pushing!',
  'Stay focused, stay legendary.',
  'Every XP counts toward greatness.',
  'Your future self is watching. Make them proud.',
  'Discipline is the bridge between goals and accomplishment.',
  'Small steps, big impact.',
  'Focus is your superpower.',
  'One more task, one step closer.',
  'Progress over perfection, always.',
  'The best time to start was yesterday. The next best is now.',
];

export const DAILY_MOTIVATION = [
  { min: 0, text: 'Let the journey begin!' },
  { min: 10, text: 'Getting started!' },
  { min: 25, text: 'Building momentum!' },
  { min: 50, text: 'Halfway there!' },
  { min: 75, text: 'Almost there!' },
  { min: 90, text: 'So close! Keep going!' },
  { min: 100, text: 'Goal smashed! Legendary!' },
];

export function getDailyQuote(): string {
  const seed = new Date().getDate() + new Date().getMonth() * 31;
  return MOTIVATIONAL_QUOTES[seed % MOTIVATIONAL_QUOTES.length];
}

export function getMotivation(progress: number): string {
  let result = DAILY_MOTIVATION[0];
  for (const m of DAILY_MOTIVATION) {
    if (progress >= m.min) result = m;
  }
  return result.text;
}

export const ECO_PER_TASK = {
  trees: 0.1,
  water: 2.5,
  co2: 0.05,
  energy: 0.3,
};

export const ECO_PER_FOCUS_MIN = {
  trees: 0.01,
  water: 0.2,
  co2: 0.008,
  energy: 0.04,
};

export function calculateEcoImpact(completedTasks: number, focusMinutes: number) {
  return {
    trees:
      completedTasks * ECO_PER_TASK.trees + focusMinutes * ECO_PER_FOCUS_MIN.trees,
    water:
      completedTasks * ECO_PER_TASK.water + focusMinutes * ECO_PER_FOCUS_MIN.water,
    co2:
      completedTasks * ECO_PER_TASK.co2 + focusMinutes * ECO_PER_FOCUS_MIN.co2,
    energy:
      completedTasks * ECO_PER_TASK.energy + focusMinutes * ECO_PER_FOCUS_MIN.energy,
  };
}

export function formatEco(value: number, unit: string): string {
  if (value < 1) return `${value.toFixed(2)} ${unit}`;
  if (value < 100) return `${value.toFixed(1)} ${unit}`;
  return `${Math.round(value)} ${unit}`;
}
