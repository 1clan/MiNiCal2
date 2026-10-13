import type { CalendarViewType, ThemeId, MetroHabit, DayRecord } from '../types/metro';
import { THEMES } from '../utils/theme';
import { metroAudio } from '../utils/audio';
import { calculateOverallNetworkStats } from '../utils/metroStats';
import { Volume2, VolumeX, Plus, Calendar, Compass, BarChart2, LayoutGrid, Download } from 'lucide-react';

interface MetroHUDProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  activeView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  habits: MetroHabit[];
  records: Record<string, DayRecord>;
  onOpenNewHabitModal: () => void;
  onOpenExportModal: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MetroHUD: React.FC<MetroHUDProps> = ({
  currentDate,
  onDateChange,
  activeView,
  onViewChange,
  theme,
  onThemeChange,
  habits,
  records,
  onOpenNewHabitModal,
  onOpenExportModal,
  isMuted,
  onToggleMute,
}) => {
  const currentTheme = THEMES[theme];
  const stats = calculateOverallNetworkStats(habits, records, currentDate);

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const currentDayOfWeekIdx = currentDate.getDay(); // 0 is Sun

  const handlePrevMonth = () => {
    metroAudio.playTrackSwitch();
    const newD = new Date(currentDate);
    newD.setMonth(newD.getMonth() - 1);
    onDateChange(newD);
  };

  const handleNextMonth = () => {
    metroAudio.playTrackSwitch();
    const newD = new Date(currentDate);
    newD.setMonth(newD.getMonth() + 1);
    onDateChange(newD);
  };

  const handleToday = () => {
    metroAudio.playTrackSwitch();
    onDateChange(new Date());
  };

  // Mini Metro Clock dial rendering (7 day segments)
  const renderClockDial = () => {
    const size = 38;
    const r = 16;
    const cx = size / 2;
    const cy = size / 2;
    const segmentAngle = 360 / 7;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={currentTheme.border} strokeWidth="2.5" />
        {/* Highlight current day of week */}
        {Array.from({ length: 7 }).map((_, i) => {
          const startAngle = (i * segmentAngle * Math.PI) / 180;
          const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180;
          const isToday = i === currentDayOfWeekIdx;

          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cy + r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cy + r * Math.sin(endAngle);

          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={isToday ? currentTheme.accent : 'transparent'}
              stroke={currentTheme.border}
              strokeWidth="0.75"
              opacity={isToday ? 0.9 : 0.2}
            />
          );
        })}
        <circle cx={cx} cy={cy} r="3" fill={currentTheme.text} />
      </svg>
    );
  };

  return (
    <header
      className="sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: currentTheme.headerBg,
        borderColor: currentTheme.border,
        color: currentTheme.text,
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Brand & Mini Metro Date Clock */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer group" onClick={handleToday} title="Click to jump to Today">
              {renderClockDial()}
              <span className="absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded bg-red-500 text-white leading-none py-0.5">
                {dayNames[currentDayOfWeekIdx]}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-widest text-lg flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: currentTheme.accent }}
                  />
                  MINI METRO CALENDAR
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full uppercase font-mono tracking-wider font-semibold border"
                  style={{ borderColor: currentTheme.border, color: currentTheme.textMuted }}>
                  v2.0
                </span>
              </div>

              {/* Month/Year Navigation */}
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  onClick={handlePrevMonth}
                  className="px-1.5 py-0.5 text-xs font-mono font-bold rounded hover:opacity-70 transition border"
                  style={{ borderColor: currentTheme.border }}
                  title="Previous Month"
                >
                  &lt;
                </button>
                <span className="text-xs font-mono font-bold tracking-wider">
                  {currentMonthName} {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="px-1.5 py-0.5 text-xs font-mono font-bold rounded hover:opacity-70 transition border"
                  style={{ borderColor: currentTheme.border }}
                  title="Next Month"
                >
                  &gt;
                </button>
                <button
                  onClick={handleToday}
                  className="text-[10px] uppercase font-mono px-2 py-0.5 rounded ml-1 transition"
                  style={{
                    backgroundColor: currentTheme.border,
                    color: currentTheme.text,
                  }}
                >
                  TODAY
                </button>
              </div>
            </div>
          </div>

          {/* Quick Network Status stats (visible on medium & large screens) */}
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l font-mono text-xs" style={{ borderColor: currentTheme.border }}>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: currentTheme.textMuted }}>
                Network Efficiency
              </span>
              <span className="font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                {stats.efficiency}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: currentTheme.textMuted }}>
                Habits Cleared
              </span>
              <span className="font-bold">
                {stats.todayCompleted} / {stats.todayTotal} Today
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: currentTheme.textMuted }}>
                Active Lines
              </span>
              <span className="font-bold flex items-center gap-1">
                {stats.activeLines} Lines
              </span>
            </div>
          </div>
        </div>

        {/* View Selectors & Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
          {/* View Mode Buttons */}
          <div
            className="flex items-center p-1 rounded-lg border gap-0.5"
            style={{
              borderColor: currentTheme.border,
              backgroundColor: currentTheme.cardBg,
            }}
          >
            <button
              onClick={() => {
                metroAudio.playTrackSwitch();
                onViewChange('month');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded transition ${
                activeView === 'month'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'hover:opacity-75'
              }`}
              style={activeView === 'month' ? { backgroundColor: currentTheme.accent } : { color: currentTheme.text }}
            >
              <LayoutGrid size={14} />
              <span>MONTH</span>
            </button>

            <button
              onClick={() => {
                metroAudio.playTrackSwitch();
                onViewChange('week');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded transition ${
                activeView === 'week'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'hover:opacity-75'
              }`}
              style={activeView === 'week' ? { backgroundColor: currentTheme.accent } : { color: currentTheme.text }}
            >
              <Calendar size={14} />
              <span>WEEK</span>
            </button>

            <button
              onClick={() => {
                metroAudio.playTrackSwitch();
                onViewChange('network');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded transition ${
                activeView === 'network'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'hover:opacity-75'
              }`}
              style={activeView === 'network' ? { backgroundColor: currentTheme.accent } : { color: currentTheme.text }}
            >
              <Compass size={14} />
              <span>NETWORK MAP</span>
            </button>

            <button
              onClick={() => {
                metroAudio.playTrackSwitch();
                onViewChange('analytics');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded transition ${
                activeView === 'analytics'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'hover:opacity-75'
              }`}
              style={activeView === 'analytics' ? { backgroundColor: currentTheme.accent } : { color: currentTheme.text }}
            >
              <BarChart2 size={14} />
              <span>LINES</span>
            </button>
          </div>

          {/* Theme Selector */}
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as ThemeId)}
            className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none transition"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.border,
              color: currentTheme.text,
            }}
          >
            <option value="canvas">Linen Paper</option>
            <option value="night">Night Mode</option>
            <option value="tokyo">Tokyo Neo</option>
            <option value="blueprint">Blueprint</option>
          </select>

          {/* Audio Chime Button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg border transition hover:opacity-80"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.border,
              color: isMuted ? currentTheme.textMuted : currentTheme.accent,
            }}
            title={isMuted ? 'Unmute procedural soundscapes' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Backup / Export */}
          <button
            onClick={onOpenExportModal}
            className="p-1.5 rounded-lg border transition hover:opacity-80"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.border,
              color: currentTheme.text,
            }}
            title="Export / Backup Network"
          >
            <Download size={16} />
          </button>

          {/* + Add Habit Line Button */}
          <button
            onClick={() => {
              metroAudio.playTrackSwitch();
              onOpenNewHabitModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition shadow-sm hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: currentTheme.accent,
              color: '#FFFFFF',
            }}
          >
            <Plus size={15} />
            <span>+ NEW LINE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
