export type StationShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'pentagon';

export type HabitCategory = 'Mind' | 'Body' | 'Focus' | 'Craft' | 'Ritual' | 'Wellness';

export interface MetroHabit {
  id: string;
  name: string;
  color: string;
  shape: StationShape;
  category: HabitCategory;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  targetPerWeek: number;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  completedHabitIds: string[];
  note?: string;
  mood?: 'great' | 'steady' | 'tired' | 'breakthrough';
  timestamp?: number;
}

export type ThemeId = 'canvas' | 'night' | 'tokyo' | 'blueprint';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bg: string;
  cardBg: string;
  headerBg: string;
  gridLine: string;
  text: string;
  textMuted: string;
  border: string;
  stationFill: string;
  stationStroke: string;
  trackUncompleted: string;
  accent: string;
}

export type CalendarViewType = 'month' | 'week' | 'network' | 'analytics';
