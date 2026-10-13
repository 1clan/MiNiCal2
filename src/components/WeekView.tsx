import { useMemo } from 'react';
import type { MetroHabit, DayRecord, ThemeConfig } from '../types/metro';
import { StationGlyph } from './StationGlyph';
import { formatDate } from '../utils/initialData';
import { calculateHabitStreak } from '../utils/metroStats';
import { metroAudio } from '../utils/audio';
import { ChevronLeft, ChevronRight, Check, Award } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  habits: MetroHabit[];
  records: Record<string, DayRecord>;
  theme: ThemeConfig;
  onToggleHabit: (dateStr: string, habitId: string) => void;
  onSelectDay: (dateStr: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  onDateChange,
  habits,
  records,
  theme,
  onToggleHabit,
  onSelectDay,
}) => {
  // Compute 7 days of current week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = (d.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);

    const days: { date: Date; dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
    const names = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const todayStr = formatDate(new Date());

    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const str = formatDate(cur);
      days.push({
        date: cur,
        dateStr: str,
        dayName: names[i],
        dayNum: cur.getDate(),
        isToday: str === todayStr,
      });
    }

    return days;
  }, [currentDate]);

  const activeHabits = habits.filter(h => h.active);

  const handlePrevWeek = () => {
    metroAudio.playTrackSwitch();
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    onDateChange(d);
  };

  const handleNextWeek = () => {
    metroAudio.playTrackSwitch();
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    onDateChange(d);
  };

  // Week range string: "Oct 12 – Oct 18, 2026"
  const weekRangeText = useMemo(() => {
    const first = weekDays[0].date;
    const last = weekDays[6].date;
    const m1 = first.toLocaleString('default', { month: 'short' });
    const m2 = last.toLocaleString('default', { month: 'short' });

    if (m1 === m2) {
      return `${m1} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
    }
    return `${m1} ${first.getDate()} – ${m2} ${last.getDate()}, ${last.getFullYear()}`;
  }, [weekDays]);

  // Total completions this week
  const weekTotalCompleted = useMemo(() => {
    let total = 0;
    weekDays.forEach(day => {
      const rec = records[day.dateStr];
      if (rec) {
        total += activeHabits.filter(h => rec.completedHabitIds.includes(h.id)).length;
      }
    });
    return total;
  }, [weekDays, records, activeHabits]);

  const weekMaxPossible = activeHabits.length * 7;
  const weekEfficiency = weekMaxPossible > 0 ? Math.round((weekTotalCompleted / weekMaxPossible) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Week Header Navigation & Metric Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-lg border hover:opacity-75 transition font-mono"
            style={{ borderColor: theme.border }}
            title="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="text-xs uppercase font-mono tracking-wider font-semibold" style={{ color: theme.textMuted }}>
              WEEKLY TRANSIT TIMETABLE
            </div>
            <div className="text-base font-mono font-bold">{weekRangeText}</div>
          </div>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-lg border hover:opacity-75 transition font-mono"
            style={{ borderColor: theme.border }}
            title="Next Week"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekly Efficiency Progress bar */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-mono uppercase" style={{ color: theme.textMuted }}>
              Weekly Passenger Volume
            </span>
            <span className="text-sm font-mono font-bold">
              {weekTotalCompleted} / {weekMaxPossible} stops ({weekEfficiency}%)
            </span>
          </div>

          <div className="w-36 h-3 rounded-full overflow-hidden border" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${weekEfficiency}%`,
                backgroundColor: theme.accent,
              }}
            />
          </div>
        </div>
      </div>

      {/* Timetable Multi-Line Board */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
        }}
      >
        {/* Table Header: Day columns */}
        <div
          className="grid grid-cols-12 border-b font-mono text-xs font-bold"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.bg,
            color: theme.textMuted,
          }}
        >
          {/* Habit Line info header */}
          <div
            className="col-span-5 md:col-span-4 p-3 border-r flex items-center justify-between"
            style={{ borderColor: theme.border }}
          >
            <span className="tracking-wider">TRANSIT LINE ROUTE</span>
            <span className="hidden sm:inline text-[10px] text-right">TARGET / STREAK</span>
          </div>

          {/* 7 Days columns */}
          <div className="col-span-7 md:col-span-8 grid grid-cols-7">
            {weekDays.map((d) => (
              <div
                key={d.dateStr}
                onClick={() => onSelectDay(d.dateStr)}
                className={`py-2 px-1 text-center border-r last:border-r-0 cursor-pointer transition hover:opacity-85 ${
                  d.isToday ? 'bg-red-500/10' : ''
                }`}
                style={{ borderColor: theme.border }}
                title="Click to view station details"
              >
                <div className={`text-[10px] font-bold ${d.isToday ? 'text-red-500 font-extrabold' : ''}`}>
                  {d.dayName}
                </div>
                <div
                  className={`text-xs font-mono font-bold inline-block px-1.5 py-0.5 rounded ${
                    d.isToday ? 'bg-red-500 text-white' : ''
                  }`}
                  style={!d.isToday ? { color: theme.text } : {}}
                >
                  {d.dayNum}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metro Lines Rows */}
        <div className="divide-y" style={{ borderColor: theme.border }}>
          {activeHabits.map((habit) => {
            const streakInfo = calculateHabitStreak(habit.id, records, currentDate);
            const weeklyCompletedCount = weekDays.filter(d =>
              records[d.dateStr]?.completedHabitIds.includes(habit.id)
            ).length;
            const targetMet = weeklyCompletedCount >= habit.targetPerWeek;

            return (
              <div
                key={habit.id}
                className="grid grid-cols-12 items-center hover:brightness-98 transition duration-150 group"
                style={{ borderColor: theme.border }}
              >
                {/* Habit Line Info */}
                <div
                  className="col-span-5 md:col-span-4 p-3 border-r flex items-center justify-between gap-2"
                  style={{ borderColor: theme.border }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Line Color Pill */}
                    <span
                      className="w-3.5 h-7 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-xs truncate flex items-center gap-1.5" style={{ color: theme.text }}>
                        <span>{habit.name}</span>
                        {targetMet && (
                          <Award size={13} className="text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] font-mono truncate" style={{ color: theme.textMuted }}>
                        {habit.category} • {habit.description || `${habit.targetPerWeek}x weekly target`}
                      </div>
                    </div>
                  </div>

                  {/* Streak & Goal Badge */}
                  <div className="hidden sm:flex flex-col items-end flex-shrink-0 font-mono text-right">
                    <span className="text-[11px] font-bold" style={{ color: habit.color }}>
                      🔥 {streakInfo.currentStreak}d streak
                    </span>
                    <span className="text-[9px]" style={{ color: theme.textMuted }}>
                      {weeklyCompletedCount}/{habit.targetPerWeek} done
                    </span>
                  </div>
                </div>

                {/* 7 Days Track & Station Stops */}
                <div className="col-span-7 md:col-span-8 grid grid-cols-7 h-full items-center">
                  {weekDays.map((d, dayIndex) => {
                    const isDone = records[d.dateStr]?.completedHabitIds.includes(habit.id);
                    const nextDay = weekDays[dayIndex + 1];
                    const nextIsDone = nextDay && records[nextDay.dateStr]?.completedHabitIds.includes(habit.id);

                    return (
                      <div
                        key={d.dateStr}
                        className="relative h-14 border-r last:border-r-0 flex items-center justify-center cursor-pointer group/cell"
                        style={{ borderColor: theme.border }}
                        onClick={() => onToggleHabit(d.dateStr, habit.id)}
                      >
                        {/* Connecting rail track line to next station in row */}
                        {dayIndex < 6 && (
                          <div
                            className={`absolute right-0 w-1/2 h-1 transition-all ${
                              isDone && nextIsDone
                                ? 'opacity-90'
                                : 'opacity-20'
                            }`}
                            style={{
                              backgroundColor: isDone && nextIsDone ? habit.color : theme.border,
                              borderTop: isDone && nextIsDone ? 'none' : '1px dashed currentColor',
                            }}
                          />
                        )}

                        {/* Connecting rail track line from prev station in row */}
                        {dayIndex > 0 && (
                          <div
                            className={`absolute left-0 w-1/2 h-1 transition-all ${
                              isDone && records[weekDays[dayIndex - 1].dateStr]?.completedHabitIds.includes(habit.id)
                                ? 'opacity-90'
                                : 'opacity-20'
                            }`}
                            style={{
                              backgroundColor: isDone && records[weekDays[dayIndex - 1].dateStr]?.completedHabitIds.includes(habit.id)
                                ? habit.color
                                : theme.border,
                            }}
                          />
                        )}

                        {/* Interactive Station Node glyph */}
                        <div
                          className={`relative z-10 transition-transform duration-200 group-hover/cell:scale-125 ${
                            isDone ? 'scale-105' : 'scale-90 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <StationGlyph
                            shape={habit.shape}
                            size={22}
                            fill={isDone ? habit.color : theme.cardBg}
                            stroke={isDone ? theme.cardBg : habit.color}
                            strokeWidth={isDone ? 1.5 : 2}
                            pulse={isDone && d.isToday}
                          />

                          {/* Mini checkmark overlay */}
                          {isDone && (
                            <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
                              <Check size={11} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        {/* Hover hint */}
                        <div className="absolute -bottom-1 text-[8px] font-mono font-bold opacity-0 group-hover/cell:opacity-100 transition text-current">
                          {isDone ? 'Served' : 'Clear stop'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week Summary / Commuter Insights */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs"
        style={{ color: theme.text }}
      >
        <div className="p-3 rounded-xl border flex items-center gap-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-blue-500 font-bold">
            🚇
          </div>
          <div>
            <div className="font-bold">Total Transit Ops</div>
            <div className="text-[11px]" style={{ color: theme.textMuted }}>
              {weekTotalCompleted} total station check-ins completed this week
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl border flex items-center gap-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-emerald-500 font-bold">
            🎯
          </div>
          <div>
            <div className="font-bold">Weekly Goal Target</div>
            <div className="text-[11px]" style={{ color: theme.textMuted }}>
              {activeHabits.filter(h => {
                const count = weekDays.filter(d => records[d.dateStr]?.completedHabitIds.includes(h.id)).length;
                return count >= h.targetPerWeek;
              }).length} of {activeHabits.length} lines on schedule
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl border flex items-center gap-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-amber-500 font-bold">
            💡
          </div>
          <div>
            <div className="font-bold">Transit Command</div>
            <div className="text-[11px]" style={{ color: theme.textMuted }}>
              Click any station node to punch in habit attendance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
