import type { MetroHabit, DayRecord } from '../types/metro';

export const DEFAULT_HABITS: MetroHabit[] = [
  {
    id: 'habit-1',
    name: 'Morning Meditation',
    color: '#EE3535', // Crimson Red
    shape: 'circle',
    category: 'Mind',
    frequency: 'daily',
    targetPerWeek: 7,
    description: '15 mins mindfulness & breathwork',
    active: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-2',
    name: 'Deep Work Sprint',
    color: '#0D84DE', // Cobalt Blue
    shape: 'square',
    category: 'Focus',
    frequency: 'weekdays',
    targetPerWeek: 5,
    description: '90m uninterrupted creative coding',
    active: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-3',
    name: 'Physical Workout / 5k',
    color: '#27963C', // Forest Green
    shape: 'triangle',
    category: 'Body',
    frequency: 'daily',
    targetPerWeek: 5,
    description: 'Running, strength or mobility session',
    active: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-4',
    name: '30m Technical Reading',
    color: '#F4B300', // Amber Yellow
    shape: 'diamond',
    category: 'Craft',
    frequency: 'daily',
    targetPerWeek: 6,
    description: 'Books, research papers & architectural docs',
    active: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-5',
    name: 'Hydration & Clean Diet',
    color: '#9A34B0', // Purple
    shape: 'cross',
    category: 'Ritual',
    frequency: 'daily',
    targetPerWeek: 7,
    description: '2.5L water & whole nutritious meals',
    active: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-6',
    name: 'Evening Reflection & Plan',
    color: '#F37324', // Orange
    shape: 'star',
    category: 'Mind',
    frequency: 'daily',
    targetPerWeek: 6,
    description: 'Review day, log progress, plan next day priorities',
    active: true,
    createdAt: '2026-10-01',
  },
];

// Helper to format date YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Generate realistic mock records for the past 45 days
export function generateDefaultRecords(): Record<string, DayRecord> {
  const records: Record<string, DayRecord> = {};
  const today = new Date(); // Use system date or 2026-10-13

  // For the past 45 days up to today
  for (let i = 45; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);

    const completed: string[] = [];
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Habit 1: High consistency (85%)
    if ((i * 7 + 3) % 10 < 8) {
      completed.push('habit-1');
    }

    // Habit 2: Weekdays mostly
    if (!isWeekend && (i * 3 + 2) % 10 < 8) {
      completed.push('habit-2');
    }

    // Habit 3: 4-5 times a week
    if ((i + 1) % 7 !== 2 && (i + 1) % 7 !== 5) {
      completed.push('habit-3');
    }

    // Habit 4: Reading
    if ((i * 5 + 1) % 10 < 7) {
      completed.push('habit-4');
    }

    // Habit 5: Hydration (very high streak)
    if (i < 12 || (i * 2) % 10 < 8) {
      completed.push('habit-5');
    }

    // Habit 6: Evening reflection
    if ((i * 4 + 5) % 10 < 7) {
      completed.push('habit-6');
    }

    records[dateStr] = {
      date: dateStr,
      completedHabitIds: completed,
      note: i === 0 ? 'Major breakthroughs today on calendar architecture!' : undefined,
      mood: completed.length >= 5 ? 'great' : completed.length >= 3 ? 'steady' : 'tired',
    };
  }

  return records;
}
