import { useRef } from 'react';
import type { MetroHabit, DayRecord, ThemeConfig } from '../types/metro';
import { metroAudio } from '../utils/audio';
import { X, Download, Upload, RotateCcw } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: MetroHabit[];
  records: Record<string, DayRecord>;
  theme: ThemeConfig;
  onImportData: (habits: MetroHabit[], records: Record<string, DayRecord>) => void;
  onResetDemo: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  habits,
  records,
  theme,
  onImportData,
  onResetDemo,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    metroAudio.playTrackSwitch();
    const data = {
      app: 'MiniMetroCalendar',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      habits,
      records,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mini-metro-calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.habits && parsed.records) {
          onImportData(parsed.habits, parsed.records);
          metroAudio.playCelebrationFanfare();
          alert('Network data restored successfully!');
          onClose();
        } else {
          alert('Invalid backup format.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in font-mono text-xs">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <div className="font-bold text-sm">TRANSIT SYSTEM ARCHIVE & BACKUP</div>
          <button
            onClick={onClose}
            className="p-1 rounded border hover:opacity-75 transition"
            style={{ borderColor: theme.border }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Download JSON Backup */}
          <button
            onClick={handleExportJSON}
            className="p-3 rounded-xl border flex items-center justify-between hover:opacity-85 transition text-left"
            style={{ borderColor: theme.border, backgroundColor: theme.bg }}
          >
            <div className="flex items-center gap-3">
              <Download size={18} className="text-blue-500" />
              <div>
                <div className="font-bold">Export JSON Backup</div>
                <div className="text-[10px]" style={{ color: theme.textMuted }}>
                  Download habits, streak records, and daily notes to file
                </div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold border px-1.5 py-0.5 rounded" style={{ borderColor: theme.border }}>
              JSON
            </span>
          </button>

          {/* Import JSON Backup */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl border flex items-center justify-between hover:opacity-85 transition text-left"
            style={{ borderColor: theme.border, backgroundColor: theme.bg }}
          >
            <div className="flex items-center gap-3">
              <Upload size={18} className="text-emerald-500" />
              <div>
                <div className="font-bold">Import JSON Backup</div>
                <div className="text-[10px]" style={{ color: theme.textMuted }}>
                  Restore previously exported transit calendar files
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <span className="text-[10px] uppercase font-bold border px-1.5 py-0.5 rounded" style={{ borderColor: theme.border }}>
              RESTORE
            </span>
          </button>

          {/* Reset Demo State */}
          <button
            onClick={() => {
              if (confirm('Reset to initial Mini Metro demo habits and sample streak data?')) {
                onResetDemo();
                onClose();
              }
            }}
            className="p-3 rounded-xl border flex items-center justify-between hover:opacity-85 transition text-left text-amber-500"
            style={{ borderColor: theme.border, backgroundColor: theme.bg }}
          >
            <div className="flex items-center gap-3">
              <RotateCcw size={18} />
              <div>
                <div className="font-bold">Reset Demo Network</div>
                <div className="text-[10px]" style={{ color: theme.textMuted }}>
                  Reload standard 6 Metro lines and 45-day demo streaks
                </div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold border px-1.5 py-0.5 rounded border-amber-500/40">
              RESET
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
