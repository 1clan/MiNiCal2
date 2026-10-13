import { useState, useMemo } from 'react';
import type { MetroHabit, DayRecord, ThemeConfig } from '../types/metro';
import { StationGlyph } from './StationGlyph';
import { formatDate } from '../utils/initialData';
import { Sparkles } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  habits: MetroHabit[];
  records: Record<string, DayRecord>;
  theme: ThemeConfig;
  onToggleHabit: (dateStr: string, habitId: string) => void;
  onSelectDay: (dateStr: string) => void;
  selectedLineFilter: string | null;
  onSelectLineFilter: (lineId: string | null) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  habits,
  records,
  theme,
  onToggleHabit,
  onSelectDay,
  selectedLineFilter,
  onSelectLineFilter,
}) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Compute days of the month grid (Monday first)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // 0 is Sunday, convert to 0 = Monday ... 6 = Sunday
    let startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const days: {
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      row: number;
      col: number;
    }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const row = 0;
      const col = startingDayOfWeek - 1 - i;
      days.push({
        date: d,
        dateStr: formatDate(d),
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        row,
        col,
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const totalIndex = days.length;
      const row = Math.floor(totalIndex / 7);
      const col = totalIndex % 7;
      days.push({
        date: d,
        dateStr: formatDate(d),
        dayNumber: day,
        isCurrentMonth: true,
        row,
        col,
      });
    }

    // Next month padding to fill out complete weeks (up to multiple of 7)
    let nextMonthDay = 1;
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, nextMonthDay);
      const totalIndex = days.length;
      const row = Math.floor(totalIndex / 7);
      const col = totalIndex % 7;
      days.push({
        date: d,
        dateStr: formatDate(d),
        dayNumber: nextMonthDay,
        isCurrentMonth: false,
        row,
        col,
      });
      nextMonthDay++;
    }

    return days;
  }, [year, month]);

  const activeHabits = useMemo(() => {
    if (selectedLineFilter) {
      return habits.filter(h => h.id === selectedLineFilter && h.active);
    }
    return habits.filter(h => h.active);
  }, [habits, selectedLineFilter]);

  const todayStr = formatDate(new Date());

  // Weekday column headers
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const totalRows = Math.ceil(calendarDays.length / 7);

  return (
    <div className="flex flex-col gap-4">
      {/* Metro Line Filter Bar */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs font-mono"
        style={{ color: theme.textMuted }}
      >
        <span className="font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
          LINE FILTER:
        </span>
        <button
          onClick={() => onSelectLineFilter(null)}
          className={`px-2.5 py-1 rounded-full border transition whitespace-nowrap font-bold ${
            selectedLineFilter === null ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: selectedLineFilter === null ? theme.text : theme.cardBg,
            borderColor: theme.border,
            color: selectedLineFilter === null ? theme.bg : theme.text,
          }}
        >
          ALL LINES ({habits.filter(h => h.active).length})
        </button>

        {habits.map((h) => {
          const isSelected = selectedLineFilter === h.id;
          return (
            <button
              key={h.id}
              onClick={() => onSelectLineFilter(isSelected ? null : h.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition whitespace-nowrap font-semibold"
              style={{
                backgroundColor: isSelected ? h.color : theme.cardBg,
                borderColor: isSelected ? h.color : theme.border,
                color: isSelected ? '#FFFFFF' : theme.text,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: isSelected ? '#FFFFFF' : h.color }}
              />
              <span>{h.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Calendar Board */}
      <div
        className="relative rounded-2xl border overflow-hidden shadow-sm"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
        }}
      >
        {/* Weekday platform headers */}
        <div
          className="grid grid-cols-7 border-b font-mono text-xs font-bold tracking-wider"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.bg,
            color: theme.textMuted,
          }}
        >
          {weekDays.map((wd, i) => (
            <div
              key={wd}
              className={`py-2.5 px-3 text-center border-r last:border-r-0 flex items-center justify-center gap-1.5 ${
                i >= 5 ? 'opacity-85' : ''
              }`}
              style={{ borderColor: theme.border }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
              <span>{wd}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid Container */}
        <div className="relative">
          {/* SVG Subway Line Layer behind day cards */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{ overflow: 'visible' }}
          >
            {/* Draw subway tracks connecting completed days */}
            {activeHabits.map((habit, habitIdx) => {
              const habitOffset = (habitIdx - (activeHabits.length - 1) / 2) * 5;

              return calendarDays.map((dayItem, idx) => {
                const rec = records[dayItem.dateStr];
                const isCompleted = rec?.completedHabitIds.includes(habit.id);

                if (!isCompleted) return null;

                // Look ahead to next day in calendar
                const nextDayItem = calendarDays[idx + 1];
                if (!nextDayItem) return null;

                const nextRec = records[nextDayItem.dateStr];
                const isNextCompleted = nextRec?.completedHabitIds.includes(habit.id);

                if (!isNextCompleted) return null;

                // If on same row (adjacent column)
                if (dayItem.row === nextDayItem.row) {
                  const colWidthPct = 100 / 7;
                  const rowHeightPct = 100 / totalRows;

                  const x1 = (dayItem.col + 0.5) * colWidthPct;
                  const y1 = (dayItem.row + 0.5) * rowHeightPct;
                  const x2 = (nextDayItem.col + 0.5) * colWidthPct;
                  const y2 = (nextDayItem.row + 0.5) * rowHeightPct;

                  return (
                    <line
                      key={`${habit.id}-${dayItem.dateStr}-h`}
                      x1={`${x1}%`}
                      y1={`calc(${y1}% + ${habitOffset}px)`}
                      x2={`${x2}%`}
                      y2={`calc(${y2}% + ${habitOffset}px)`}
                      stroke={habit.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  );
                }

                // If connecting Sunday (col 6) to next week's Monday (col 0)
                if (dayItem.col === 6 && nextDayItem.col === 0 && nextDayItem.row === dayItem.row + 1) {
                  const colWidthPct = 100 / 7;
                  const rowHeightPct = 100 / totalRows;

                  const x1 = (dayItem.col + 0.5) * colWidthPct;
                  const y1 = (dayItem.row + 0.5) * rowHeightPct;
                  const x2 = (nextDayItem.col + 0.5) * colWidthPct;
                  const y2 = (nextDayItem.row + 0.5) * rowHeightPct;

                  // Mini Metro stylized curve track to next line
                  return (
                    <path
                      key={`${habit.id}-${dayItem.dateStr}-wrap`}
                      d={`M calc(${x1}% + 20px) calc(${y1}% + ${habitOffset}px) 
                          C calc(${x1}% + 35px) calc(${y1}% + ${habitOffset}px), 
                            calc(${x2}% - 35px) calc(${y2}% + ${habitOffset}px), 
                            calc(${x2}% - 20px) calc(${y2}% + ${habitOffset}px)`}
                      fill="none"
                      stroke={habit.color}
                      strokeWidth="3"
                      strokeDasharray="4 3"
                      opacity="0.45"
                    />
                  );
                }

                return null;
              });
            })}
          </svg>

          {/* Day Grid Cells */}
          <div
            className="grid grid-cols-7"
            style={{
              backgroundColor: theme.cardBg,
            }}
          >
            {calendarDays.map((dayItem) => {
              const isToday = dayItem.dateStr === todayStr;
              const rec = records[dayItem.dateStr];
              const completedHabits = activeHabits.filter(h =>
                rec?.completedHabitIds.includes(h.id)
              );
              const isHovered = hoveredDate === dayItem.dateStr;
              const isAllCompleted = activeHabits.length > 0 && completedHabits.length === activeHabits.length;

              return (
                <div
                  key={dayItem.dateStr}
                  onMouseEnter={() => setHoveredDate(dayItem.dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => onSelectDay(dayItem.dateStr)}
                  className={`relative min-h-[110px] sm:min-h-[125px] p-2 border-r border-b transition-all duration-150 cursor-pointer group flex flex-col justify-between ${
                    dayItem.col === 6 ? 'border-r-0' : ''
                  } ${
                    !dayItem.isCurrentMonth ? 'opacity-35' : ''
                  } ${
                    isToday ? 'ring-2 ring-inset ring-red-500/80' : ''
                  }`}
                  style={{
                    borderColor: theme.border,
                    backgroundColor: isHovered
                      ? theme.bg
                      : isToday
                      ? `${theme.bg}`
                      : 'transparent',
                  }}
                >
                  {/* Station Day Header */}
                  <div className="flex items-center justify-between z-20">
                    <span
                      className={`text-xs font-mono font-bold tracking-tight rounded-md px-1.5 py-0.5 ${
                        isToday
                          ? 'bg-red-500 text-white'
                          : 'text-current'
                      }`}
                      style={!isToday ? { color: theme.text } : {}}
                    >
                      {dayItem.dayNumber}
                    </span>

                    {/* All Clear / Star indicator */}
                    {isAllCompleted && dayItem.isCurrentMonth && (
                      <span
                        className="text-[10px] font-mono px-1 rounded flex items-center gap-0.5 text-amber-500 bg-amber-500/10 font-bold"
                        title="All Metro Lines Cleared!"
                      >
                        <Sparkles size={11} />
                        ALL
                      </span>
                    )}

                    {/* Completion count fraction */}
                    {dayItem.isCurrentMonth && activeHabits.length > 0 && (
                      <span
                        className="text-[10px] font-mono font-semibold"
                        style={{ color: theme.textMuted }}
                      >
                        {completedHabits.length}/{activeHabits.length}
                      </span>
                    )}
                  </div>

                  {/* Central Station Glyphs Node */}
                  <div className="my-auto py-1 flex items-center justify-center gap-1 z-20 flex-wrap">
                    {completedHabits.length === 0 ? (
                      // Unvisited / empty station marker
                      <div
                        className="w-4 h-4 rounded-full border-2 border-dashed transition-transform group-hover:scale-110"
                        style={{ borderColor: theme.border }}
                      />
                    ) : (
                      // Display station glyphs for completed lines
                      completedHabits.slice(0, 4).map((h) => (
                        <div
                          key={h.id}
                          className="transition-transform group-hover:scale-115"
                          title={`${h.name} (Served)`}
                        >
                          <StationGlyph
                            shape={h.shape}
                            size={18}
                            fill={h.color}
                            stroke={theme.cardBg}
                            strokeWidth={1.5}
                          />
                        </div>
                      ))
                    )}
                    {completedHabits.length > 4 && (
                      <span
                        className="text-[9px] font-mono font-bold px-1 rounded-full"
                        style={{ backgroundColor: theme.border, color: theme.text }}
                      >
                        +{completedHabits.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Bottom: Mini Metro track route indicator bars */}
                  <div className="z-20 flex items-center gap-1 overflow-hidden pt-1">
                    {activeHabits.map((h) => {
                      const done = rec?.completedHabitIds.includes(h.id);
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleHabit(dayItem.dateStr, h.id);
                          }}
                          className={`h-2 flex-1 rounded-sm transition-all duration-200 relative group/track ${
                            done ? 'opacity-100 shadow-sm' : 'opacity-20 hover:opacity-60'
                          }`}
                          style={{
                            backgroundColor: h.color,
                          }}
                          title={`${h.name}: ${done ? 'Completed (Click to uncheck)' : 'Pending (Click to complete)'}`}
                        >
                          {done && (
                            <span className="sr-only">Done</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Reflection note indicator badge */}
                  {rec?.note && (
                    <span
                      className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500 z-30"
                      title={rec.note}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend & Station Status Info Bar */}
      <div
        className="p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text,
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: theme.textMuted }}>
            METRO CODING:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-red-500" />
            <span>Active Rail Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-gray-400" />
            <span>Unserved Station</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
            <span>Served Station Stop</span>
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ color: theme.textMuted }}>
          <span>Tip: Click any station date to open Station Control & Daily Notes</span>
        </div>
      </div>
    </div>
  );
};
