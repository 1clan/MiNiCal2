import { useState, useEffect } from 'react';
import type { MetroHabit, DayRecord, ThemeId, CalendarViewType } from './types/metro';
import { DEFAULT_HABITS, generateDefaultRecords } from './utils/initialData';
import { THEMES } from './utils/theme';
import { metroAudio } from './utils/audio';
import { MetroHUD } from './components/MetroHUD';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { MetroNetworkView } from './components/MetroNetworkView';
import { AnalyticsView } from './components/AnalyticsView';
import { StationDetailModal } from './components/StationDetailModal';
import { HabitModal } from './components/HabitModal';
import { ExportModal } from './components/ExportModal';

const HABITS_STORAGE_KEY = 'minical_metro_habits_v2';
const RECORDS_STORAGE_KEY = 'minical_metro_records_v2';
const THEME_STORAGE_KEY = 'minical_metro_theme_v2';
const MUTE_STORAGE_KEY = 'minical_metro_muted_v2';

export function App() {
  // State for Habits
  const [habits, setHabits] = useState<MetroHabit[]>(() => {
    try {
      const saved = localStorage.getItem(HABITS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_HABITS;
  });

  // State for Records
  const [records, setRecords] = useState<Record<string, DayRecord>>(() => {
    try {
      const saved = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return generateDefaultRecords();
  });

  // State for Theme
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {
      // Fallback
    }
    return 'canvas';
  });

  // Sound Muted state
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(MUTE_STORAGE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Active view
  const [activeView, setActiveView] = useState<CalendarViewType>('month');

  // Currently viewed / navigated date (defaults to today)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filter line in Month view
  const [selectedLineFilter, setSelectedLineFilter] = useState<string | null>(null);

  // Modals
  const [selectedStationDate, setSelectedStationDate] = useState<string | null>(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<MetroHabit | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    } catch {
      // Ignore
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Ignore
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // Ignore
    }
  }, [themeId]);

  useEffect(() => {
    metroAudio.setMuted(isMuted);
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    } catch {
      // Ignore
    }
  }, [isMuted]);

  const currentTheme = THEMES[themeId];

  // Habit Toggle Handler
  const handleToggleHabit = (dateStr: string, habitId: string) => {
    setRecords((prev) => {
      const existing = prev[dateStr];
      const completedList = existing ? [...existing.completedHabitIds] : [];
      const idx = completedList.indexOf(habitId);

      if (idx > -1) {
        completedList.splice(idx, 1);
        metroAudio.playHabitUncheck();
      } else {
        completedList.push(habitId);
        metroAudio.playHabitComplete(completedList.length);
      }

      return {
        ...prev,
        [dateStr]: {
          date: dateStr,
          completedHabitIds: completedList,
          note: existing?.note,
          mood: existing?.mood,
          timestamp: Date.now(),
        },
      };
    });
  };

  // Station Reflection Note Handler
  const handleSaveDayNote = (dateStr: string, note: string, mood?: DayRecord['mood']) => {
    setRecords((prev) => {
      const existing = prev[dateStr];
      return {
        ...prev,
        [dateStr]: {
          date: dateStr,
          completedHabitIds: existing?.completedHabitIds || [],
          note: note.trim() || undefined,
          mood: mood || existing?.mood,
          timestamp: Date.now(),
        },
      };
    });
  };

  // Habit Creation / Update Handler
  const handleSaveHabit = (habitToSave: MetroHabit) => {
    setHabits((prev) => {
      const idx = prev.findIndex((h) => h.id === habitToSave.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = habitToSave;
        return copy;
      }
      return [habitToSave, ...prev];
    });
  };

  // Delete Habit Handler
  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    if (selectedLineFilter === habitId) {
      setSelectedLineFilter(null);
    }
  };

  // Import JSON Data Handler
  const handleImportData = (newHabits: MetroHabit[], newRecords: Record<string, DayRecord>) => {
    setHabits(newHabits);
    setRecords(newRecords);
  };

  // Reset Demo State Handler
  const handleResetDemo = () => {
    const demoHabits = DEFAULT_HABITS;
    const demoRecords = generateDefaultRecords();
    setHabits(demoHabits);
    setRecords(demoRecords);
    metroAudio.playCelebrationFanfare();
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
      }}
    >
      {/* Top HUD with Mini Metro clock & view controllers */}
      <MetroHUD
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        activeView={activeView}
        onViewChange={setActiveView}
        theme={themeId}
        onThemeChange={setThemeId}
        habits={habits}
        records={records}
        onOpenNewHabitModal={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {activeView === 'month' && (
          <MonthView
            currentDate={currentDate}
            habits={habits}
            records={records}
            theme={currentTheme}
            onToggleHabit={handleToggleHabit}
            onSelectDay={setSelectedStationDate}
            selectedLineFilter={selectedLineFilter}
            onSelectLineFilter={setSelectedLineFilter}
          />
        )}

        {activeView === 'week' && (
          <WeekView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            habits={habits}
            records={records}
            theme={currentTheme}
            onToggleHabit={handleToggleHabit}
            onSelectDay={setSelectedStationDate}
          />
        )}

        {activeView === 'network' && (
          <MetroNetworkView
            currentDate={currentDate}
            habits={habits}
            records={records}
            theme={currentTheme}
            onToggleHabit={handleToggleHabit}
            onSelectDay={setSelectedStationDate}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView
            currentDate={currentDate}
            habits={habits}
            records={records}
            theme={currentTheme}
            onEditHabit={(h) => {
              setEditingHabit(h);
              setIsHabitModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
          />
        )}
      </main>

      {/* Station Control & Notes Modal */}
      <StationDetailModal
        dateStr={selectedStationDate}
        onClose={() => setSelectedStationDate(null)}
        habits={habits}
        records={records}
        theme={currentTheme}
        onToggleHabit={handleToggleHabit}
        onSaveDayNote={handleSaveDayNote}
        onNavigateDate={setSelectedStationDate}
      />

      {/* Create / Edit Habit Line Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={handleSaveHabit}
        editingHabit={editingHabit}
        theme={currentTheme}
      />

      {/* System Archive & Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        habits={habits}
        records={records}
        theme={currentTheme}
        onImportData={handleImportData}
        onResetDemo={handleResetDemo}
      />

      {/* Minimalist Footer */}
      <footer
        className="py-4 text-center font-mono text-[11px] border-t tracking-wider mt-auto"
        style={{
          borderColor: currentTheme.border,
          color: currentTheme.textMuted,
        }}
      >
        <span>MINI METRO CALENDAR & HABIT TRACKER • SUBWAY TRANSIT NETWORK SYSTEM</span>
      </footer>
    </div>
  );
}

export default App;
