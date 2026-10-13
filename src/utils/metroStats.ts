import type { MetroHabit, DayRecord } from '../types/metro';
import { formatDate } from './initialData';

export interface HabitStreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0 - 100
  weeklyCompletion: number; // completed in current week
}

export function calculateHabitStreak(
  habitId: string,
  records: Record<string, DayRecord>,
  today: Date = new Date()
): HabitStreakInfo {
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;
  let totalCompletions = 0;

  // Check last 90 days in reverse to find streaks
  const checkDays = 90;
  const isCompletedToday = records[formatDate(today)]?.completedHabitIds.includes(habitId) ?? false;

  // For current streak: start from today or yesterday
  let d = new Date(today);
  if (!isCompletedToday) {
    // If not completed today yet, check if yesterday was completed
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    const dStr = formatDate(d);
    if (records[dStr]?.completedHabitIds.includes(habitId)) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak and total over past checkDays
  for (let i = checkDays; i >= 0; i--) {
    const pastD = new Date(today);
    pastD.setDate(today.getDate() - i);
    const dateStr = formatDate(pastD);

    if (records[dateStr]?.completedHabitIds.includes(habitId)) {
      runningStreak++;
      totalCompletions++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  // Calculate current week completions (from Monday to Sunday)
  let weeklyCompletion = 0;
  const curr = new Date(today);
  const firstDayOfWeek = curr.getDate() - ((curr.getDay() + 6) % 7); // Monday
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const weekDate = new Date(curr.setDate(firstDayOfWeek + dayOffset));
    const wStr = formatDate(weekDate);
    if (records[wStr]?.completedHabitIds.includes(habitId)) {
      weeklyCompletion++;
    }
  }

  const completionRate = Math.round((totalCompletions / (checkDays + 1)) * 100);

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompletions,
    completionRate,
    weeklyCompletion,
  };
}

export function calculateOverallNetworkStats(
  habits: MetroHabit[],
  records: Record<string, DayRecord>,
  today: Date = new Date()
) {
  const activeHabits = habits.filter(h => h.active);
  if (activeHabits.length === 0) {
    return {
      efficiency: 0,
      totalTrips: 0,
      activeLines: 0,
      todayCompleted: 0,
      todayTotal: 0,
    };
  }

  const todayStr = formatDate(today);
  const todayRec = records[todayStr];
  const todayCompleted = todayRec
    ? activeHabits.filter(h => todayRec.completedHabitIds.includes(h.id)).length
    : 0;

  let totalPossible = 0;
  let totalAchieved = 0;
  const checkDays = 30;

  for (let i = 0; i < checkDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = formatDate(d);
    const rec = records[dStr];

    activeHabits.forEach(h => {
      totalPossible++;
      if (rec?.completedHabitIds.includes(h.id)) {
        totalAchieved++;
      }
    });
  }

  const efficiency = totalPossible > 0 ? Math.round((totalAchieved / totalPossible) * 100) : 0;

  return {
    efficiency,
    totalTrips: totalAchieved,
    activeLines: activeHabits.length,
    todayCompleted,
    todayTotal: activeHabits.length,
  };
}
