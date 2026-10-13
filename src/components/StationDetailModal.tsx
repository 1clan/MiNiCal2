import { useState, useEffect } from 'react';
import type { MetroHabit, DayRecord, ThemeConfig } from '../types/metro';
import { StationGlyph } from './StationGlyph';
import { formatDate } from '../utils/initialData';
import { metroAudio } from '../utils/audio';
import { X, Check, Sparkles, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StationDetailModalProps {
  dateStr: string | null;
  onClose: () => void;
  habits: MetroHabit[];
  records: Record<string, DayRecord>;
  theme: ThemeConfig;
  onToggleHabit: (dateStr: string, habitId: string) => void;
  onSaveDayNote: (dateStr: string, note: string, mood?: DayRecord['mood']) => void;
  onNavigateDate: (newDateStr: string) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  dateStr,
  onClose,
  habits,
  records,
  theme,
  onToggleHabit,
  onSaveDayNote,
  onNavigateDate,
}) => {
  if (!dateStr) return null;

  const activeHabits = habits.filter(h => h.active);
  const currentRecord = records[dateStr];
  const completedIds = currentRecord?.completedHabitIds || [];

  const [noteText, setNoteText] = useState<string>(currentRecord?.note || '');
  const [selectedMood, setSelectedMood] = useState<DayRecord['mood']>(currentRecord?.mood || 'steady');

  useEffect(() => {
    setNoteText(currentRecord?.note || '');
    setSelectedMood(currentRecord?.mood || 'steady');
  }, [dateStr, currentRecord]);

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  const formattedTitle = dateObj.toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrevDay = () => {
    metroAudio.playTrackSwitch();
    const prev = new Date(dateObj);
    prev.setDate(prev.getDate() - 1);
    onNavigateDate(formatDate(prev));
  };

  const handleNextDay = () => {
    metroAudio.playTrackSwitch();
    const next = new Date(dateObj);
    next.setDate(next.getDate() + 1);
    onNavigateDate(formatDate(next));
  };

  const handleSaveNote = () => {
    onSaveDayNote(dateStr, noteText, selectedMood);
    metroAudio.playStationTap(3);
  };

  const handleHabitToggleWithCelebration = (habitId: string) => {
    const willComplete = !completedIds.includes(habitId);
    onToggleHabit(dateStr, habitId);

    // If this toggle completes all active habits for the day, trigger confetti and fanfare!
    if (willComplete && completedIds.length + 1 === activeHabits.length) {
      metroAudio.playCelebrationFanfare();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: activeHabits.map(h => h.color),
      });
    }
  };

  const isAllCleared = activeHabits.length > 0 && completedIds.length === activeHabits.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded border hover:opacity-75 transition"
              style={{ borderColor: theme.border }}
              title="Previous Day"
            >
              <ChevronLeft size={14} />
            </button>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>
                STATION CONTROL CENTER
              </div>
              <div className="text-sm font-bold">{formattedTitle}</div>
            </div>
            <button
              onClick={handleNextDay}
              className="p-1 rounded border hover:opacity-75 transition"
              style={{ borderColor: theme.border }}
              title="Next Day"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border hover:opacity-75 transition"
            style={{ borderColor: theme.border }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4">
          {/* Station Clearance Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              isAllCleared ? 'bg-amber-500/10 border-amber-500/30' : ''
            }`}
            style={!isAllCleared ? { borderColor: theme.border, backgroundColor: theme.bg } : {}}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${isAllCleared ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <div>
                <div className="font-bold">
                  {completedIds.length} of {activeHabits.length} Lines In Service
                </div>
                <div className="text-[10px]" style={{ color: theme.textMuted }}>
                  {isAllCleared ? 'Full network schedule achieved today!' : 'Pending lines waiting for dispatch'}
                </div>
              </div>
            </div>

            {isAllCleared && (
              <span className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                <Sparkles size={14} />
                CLEARED
              </span>
            )}
          </div>

          {/* Active Lines Checklist */}
          <div>
            <div className="font-bold uppercase tracking-wider text-[10px] mb-2" style={{ color: theme.textMuted }}>
              TRANSIT LINE DISPATCH:
            </div>
            <div className="flex flex-col gap-2">
              {activeHabits.map((habit) => {
                const isDone = completedIds.includes(habit.id);

                return (
                  <div
                    key={habit.id}
                    onClick={() => handleHabitToggleWithCelebration(habit.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                      isDone ? 'brightness-98 shadow-xs' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isDone ? habit.color : theme.border,
                      backgroundColor: isDone ? `${habit.color}14` : theme.cardBg,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <StationGlyph
                        shape={habit.shape}
                        size={22}
                        fill={isDone ? habit.color : 'transparent'}
                        stroke={habit.color}
                        strokeWidth={2}
                      />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{habit.name}</span>
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: habit.color }}
                          />
                        </div>
                        <div className="text-[10px]" style={{ color: theme.textMuted }}>
                          {habit.category} • {habit.description || `${habit.targetPerWeek}x weekly target`}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <div
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                        isDone ? 'text-white' : 'border-gray-400'
                      }`}
                      style={{
                        backgroundColor: isDone ? habit.color : 'transparent',
                        borderColor: isDone ? habit.color : theme.border,
                      }}
                    >
                      {isDone && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Station Log & Reflection Notes */}
          <div className="pt-2 border-t" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                <MessageSquare size={12} />
                <span>STATION LOG & NOTES:</span>
              </span>

              {/* Mood selector */}
              <div className="flex items-center gap-1">
                {(['great', 'steady', 'tired', 'breakthrough'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={`px-1.5 py-0.5 rounded text-[9px] uppercase border font-bold transition ${
                      selectedMood === m ? 'border-current font-extrabold shadow-xs' : 'opacity-50'
                    }`}
                    style={{
                      borderColor: selectedMood === m ? theme.accent : theme.border,
                      color: selectedMood === m ? theme.accent : theme.text,
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record daily reflection, milestones, or commute notes for this date..."
              className="w-full p-2.5 rounded-xl border text-xs outline-none focus:ring-1 resize-none h-20 transition"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
            />

            <button
              onClick={handleSaveNote}
              className="mt-2 w-full py-2 rounded-xl border font-bold hover:opacity-85 transition"
              style={{
                backgroundColor: theme.accent,
                borderColor: theme.accent,
                color: '#FFFFFF',
              }}
            >
              SAVE STATION LOG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
