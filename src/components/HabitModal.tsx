import { useState, useEffect } from 'react';
import type { MetroHabit, StationShape, HabitCategory, ThemeConfig } from '../types/metro';
import { METRO_COLORS } from '../utils/theme';
import { StationGlyph } from './StationGlyph';
import { metroAudio } from '../utils/audio';
import { X, Check } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habit: MetroHabit) => void;
  editingHabit: MetroHabit | null;
  theme: ThemeConfig;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSaveHabit,
  editingHabit,
  theme,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState<string>('');
  const [color, setColor] = useState<string>(METRO_COLORS[0].hex);
  const [shape, setShape] = useState<StationShape>('circle');
  const [category, setCategory] = useState<HabitCategory>('Mind');
  const [targetPerWeek, setTargetPerWeek] = useState<number>(7);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setColor(editingHabit.color);
      setShape(editingHabit.shape);
      setCategory(editingHabit.category);
      setTargetPerWeek(editingHabit.targetPerWeek);
      setDescription(editingHabit.description || '');
    } else {
      setName('');
      setColor(METRO_COLORS[Math.floor(Math.random() * METRO_COLORS.length)].hex);
      setShape('circle');
      setCategory('Focus');
      setTargetPerWeek(5);
      setDescription('');
    }
  }, [editingHabit, isOpen]);

  const shapes: StationShape[] = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star', 'pentagon'];
  const categories: HabitCategory[] = ['Mind', 'Body', 'Focus', 'Craft', 'Ritual', 'Wellness'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitToSave: MetroHabit = {
      id: editingHabit ? editingHabit.id : `habit-${Date.now()}`,
      name: name.trim(),
      color,
      shape,
      category,
      frequency: targetPerWeek === 7 ? 'daily' : targetPerWeek === 5 ? 'weekdays' : 'custom',
      targetPerWeek,
      description: description.trim(),
      active: true,
      createdAt: editingHabit ? editingHabit.createdAt : new Date().toISOString(),
    };

    metroAudio.playCelebrationFanfare();
    onSaveHabit(habitToSave);
    onClose();
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
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="font-bold text-sm">
              {editingHabit ? 'EDIT TRANSIT LINE' : 'COMMISSION NEW METRO LINE'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded border hover:opacity-75 transition"
            style={{ borderColor: theme.border }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          {/* Habit / Line Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: theme.textMuted }}>
              Line Name (Habit Title):
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 5km Run, Meditation, Deep Coding..."
              className="w-full p-2.5 rounded-xl border outline-none text-xs"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
            />
          </div>

          {/* Color Palette Picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: theme.textMuted }}>
              Metro Line Color:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {METRO_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`h-8 rounded-lg flex items-center justify-center transition border ${
                    color === c.hex ? 'ring-2 ring-offset-2 ring-current font-bold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: c.hex,
                    borderColor: theme.border,
                  }}
                  title={c.label}
                >
                  {color === c.hex && <Check size={14} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Station Shape Glyph */}
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: theme.textMuted }}>
              Station Shape Glyph:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {shapes.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setShape(s)}
                  className={`p-2 rounded-xl border flex items-center justify-center flex-1 transition ${
                    shape === s ? 'ring-2 ring-current font-bold' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: shape === s ? color : theme.border,
                    backgroundColor: shape === s ? `${color}18` : theme.bg,
                  }}
                  title={s}
                >
                  <StationGlyph
                    shape={s}
                    size={22}
                    fill={shape === s ? color : 'transparent'}
                    stroke={color}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Category & Target */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: theme.textMuted }}>
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full p-2 rounded-xl border outline-none text-xs"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: theme.textMuted }}>
                Weekly Target:
              </label>
              <select
                value={targetPerWeek}
                onChange={(e) => setTargetPerWeek(Number(e.target.value))}
                className="w-full p-2 rounded-xl border outline-none text-xs"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    {num} days / week {num === 7 ? '(Daily)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description / Instructions */}
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: theme.textMuted }}>
              Target Details / Notes:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 15 minutes minimum, morning routine"
              className="w-full p-2 rounded-xl border outline-none text-xs"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl border hover:opacity-75 transition font-semibold"
              style={{ borderColor: theme.border }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-bold transition shadow-sm hover:brightness-110 text-white"
              style={{
                backgroundColor: color,
              }}
            >
              {editingHabit ? 'Save Line Changes' : 'Open Transit Line'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
