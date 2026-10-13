import type { MetroHabit, DayRecord, ThemeConfig } from '../types/metro';
import { StationGlyph } from './StationGlyph';
import { calculateHabitStreak, calculateOverallNetworkStats } from '../utils/metroStats';
import { formatDate } from '../utils/initialData';
import { Edit2, Trash2, Award, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { metroAudio } from '../utils/audio';

interface AnalyticsViewProps {
  currentDate: Date;
  habits: MetroHabit[];
  records: Record<string, DayRecord>;
  theme: ThemeConfig;
  onEditHabit: (habit: MetroHabit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentDate,
  habits,
  records,
  theme,
  onEditHabit,
  onDeleteHabit,
}) => {
  const stats = calculateOverallNetworkStats(habits, records, currentDate);

  return (
    <div className="flex flex-col gap-5">
      {/* Network Overview Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
              Network Efficiency
            </span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-2">{stats.efficiency}%</div>
          <div className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
            System-wide punctuality (30-day window)
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex flex-col justify-between"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
              Total Passengers Served
            </span>
            <CheckCircle size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-2">{stats.totalTrips}</div>
          <div className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
            Total habit stations cleared
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex flex-col justify-between"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
              Active Metro Routes
            </span>
            <Zap size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-2">{stats.activeLines} Lines</div>
          <div className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
            Transit corridors currently in service
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex flex-col justify-between"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
              Today's Network Status
            </span>
            <Award size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black mt-2">
            {stats.todayCompleted} / {stats.todayTotal}
          </div>
          <div className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
            {stats.todayCompleted === stats.todayTotal && stats.todayTotal > 0
              ? '✨ Full Transit Line Clearance!'
              : 'Stations awaiting evening arrival'}
          </div>
        </div>
      </div>

      {/* Individual Transit Line Cards */}
      <div className="flex flex-col gap-3 font-mono">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
          TRANSIT LINE PERFORMANCE & TIMELINE
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const streak = calculateHabitStreak(habit.id, records, currentDate);

            // Last 30 days micro-rail track
            const past30Days: { dateStr: string; done: boolean }[] = [];
            for (let i = 29; i >= 0; i--) {
              const d = new Date(currentDate);
              d.setDate(currentDate.getDate() - i);
              const str = formatDate(d);
              past30Days.push({
                dateStr: str,
                done: records[str]?.completedHabitIds.includes(habit.id) ?? false,
              });
            }

            return (
              <div
                key={habit.id}
                className="p-4 rounded-2xl border flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              >
                {/* Header: Line color, station shape, and actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <StationGlyph
                      shape={habit.shape}
                      size={28}
                      fill={habit.color}
                      stroke={theme.cardBg}
                      strokeWidth={2}
                    />
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{habit.name}</span>
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: habit.color }}
                        />
                      </div>
                      <div className="text-[11px]" style={{ color: theme.textMuted }}>
                        {habit.category} • Target {habit.targetPerWeek}x weekly
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1.5 rounded-lg border hover:opacity-75 transition"
                      style={{ borderColor: theme.border }}
                      title="Edit Habit Line"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove transit line "${habit.name}"?`)) {
                          metroAudio.playTrackSwitch();
                          onDeleteHabit(habit.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border hover:text-red-500 hover:border-red-500 transition"
                      style={{ borderColor: theme.border }}
                      title="Delete Transit Line"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl border text-center" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                  <div>
                    <div className="text-[10px] uppercase" style={{ color: theme.textMuted }}>
                      Current Streak
                    </div>
                    <div className="text-base font-bold mt-0.5" style={{ color: habit.color }}>
                      🔥 {streak.currentStreak}d
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase" style={{ color: theme.textMuted }}>
                      Longest Streak
                    </div>
                    <div className="text-base font-bold mt-0.5">
                      ⭐ {streak.longestStreak}d
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase" style={{ color: theme.textMuted }}>
                      Uptime Rate
                    </div>
                    <div className="text-base font-bold mt-0.5">
                      {streak.completionRate}%
                    </div>
                  </div>
                </div>

                {/* 30-Day Railway Track Heatmap */}
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1.5" style={{ color: theme.textMuted }}>
                    <span>30-DAY RAIL CORRIDOR</span>
                    <span>{streak.totalCompletions} Stops Served</span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {past30Days.map((item, idx) => (
                      <div
                        key={idx}
                        className={`h-4 flex-1 min-w-[7px] rounded-xs transition-transform hover:scale-125 ${
                          item.done ? 'shadow-xs' : 'opacity-20'
                        }`}
                        style={{
                          backgroundColor: item.done ? habit.color : theme.border,
                        }}
                        title={`${item.dateStr}: ${item.done ? 'Completed' : 'Missed'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
