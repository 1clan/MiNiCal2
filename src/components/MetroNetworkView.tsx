import React, { useState, useEffect, useRef } from 'react';
import type { MetroHabit, DayRecord, ThemeConfig } from '../types/metro';
import { formatDate } from '../utils/initialData';
import { Play, Pause, FastForward, RotateCcw, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { metroAudio } from '../utils/audio';

interface MetroNetworkViewProps {
  currentDate: Date;
  habits: MetroHabit[];
  records: Record<string, DayRecord>;
  theme: ThemeConfig;
  onToggleHabit: (dateStr: string, habitId: string) => void;
  onSelectDay: (dateStr: string) => void;
}

export const MetroNetworkView: React.FC<MetroNetworkViewProps> = ({
  currentDate,
  habits,
  records,
  theme,
  onSelectDay,
}) => {

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedStationDate, setSelectedStationDate] = useState<string | null>(null);

  // Animation frame loop for moving trains along active transit tracks
  const [trainProgress, setTrainProgress] = useState<number>(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setTrainProgress(prev => (prev + dt * 0.12 * speed) % 1);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed]);

  // Construct topological stations for the current 14-day network window
  const stations = React.useMemo(() => {
    const list: {
      id: string;
      dateStr: string;
      label: string;
      dayNum: number;
      x: number;
      y: number;
      isToday: boolean;
    }[] = [];

    const today = new Date(currentDate);
    const todayStr = formatDate(new Date());

    // Generate 14 station nodes in a pleasant Mini Metro topological map arrangement
    // with 45-degree angled layout
    const coords = [
      { x: 120, y: 150 },
      { x: 220, y: 150 },
      { x: 340, y: 120 },
      { x: 460, y: 180 },
      { x: 580, y: 180 },
      { x: 700, y: 240 },
      { x: 800, y: 320 },
      { x: 740, y: 440 },
      { x: 620, y: 480 },
      { x: 500, y: 420 },
      { x: 380, y: 480 },
      { x: 260, y: 420 },
      { x: 180, y: 320 },
      { x: 120, y: 230 },
    ];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const str = formatDate(d);
      const coord = coords[13 - i] || { x: 300, y: 300 };

      list.push({
        id: str,
        dateStr: str,
        label: d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' }),
        dayNum: d.getDate(),
        x: coord.x,
        y: coord.y,
        isToday: str === todayStr,
      });
    }

    return list;
  }, [currentDate]);

  const activeHabits = habits.filter(h => h.active);

  // Build SVG paths for each habit connecting its completed stations
  const habitRoutes = React.useMemo(() => {
    return activeHabits.map((habit, habitIdx) => {
      // Find stations completed for this habit
      const completedStations = stations.filter(st => {
        const rec = records[st.dateStr];
        return rec?.completedHabitIds.includes(habit.id);
      });

      // Shift line offset so parallel lines don't completely overlap
      const offset = (habitIdx - (activeHabits.length - 1) / 2) * 6;

      let pathD = '';
      if (completedStations.length > 1) {
        pathD = `M ${completedStations[0].x + offset} ${completedStations[0].y + offset}`;
        for (let i = 1; i < completedStations.length; i++) {
          const prev = completedStations[i - 1];
          const curr = completedStations[i];
          // 45-degree angle routing
          const midX = (prev.x + curr.x) / 2 + offset;
          const midY = (prev.y + curr.y) / 2 + offset;
          pathD += ` Q ${midX} ${midY} ${curr.x + offset} ${curr.y + offset}`;
        }
      }

      return {
        habit,
        completedStations,
        pathD,
        offset,
      };
    });
  }, [activeHabits, stations, records]);

  return (
    <div className="flex flex-col gap-4">
      {/* Simulation Controls HUD */}
      <div
        className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-sm font-mono text-xs"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                metroAudio.playTrackSwitch();
                setIsPlaying(!isPlaying);
              }}
              className="p-2 rounded-lg border font-bold flex items-center gap-1.5 hover:opacity-80 transition"
              style={{
                backgroundColor: isPlaying ? theme.accent : theme.bg,
                borderColor: theme.border,
                color: isPlaying ? '#FFFFFF' : theme.text,
              }}
              title={isPlaying ? 'Pause Train Traffic' : 'Resume Trains'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'RUNNING' : 'PAUSED'}</span>
            </button>

            <button
              onClick={() => {
                metroAudio.playTrackSwitch();
                setSpeed(speed === 1 ? 2 : 1);
              }}
              className="p-2 rounded-lg border flex items-center gap-1 hover:opacity-80 transition"
              style={{
                backgroundColor: speed > 1 ? theme.accent : theme.cardBg,
                borderColor: theme.border,
                color: speed > 1 ? '#FFFFFF' : theme.text,
              }}
              title="Fast Forward Simulation"
            >
              <FastForward size={14} />
              <span>{speed}x</span>
            </button>
          </div>

          <span className="hidden sm:inline" style={{ color: theme.textMuted }}>
            Topological Habit Network (Past 14 Days)
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.7, zoom - 0.15))}
            className="p-1.5 rounded-lg border hover:opacity-80"
            style={{ borderColor: theme.border }}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="font-mono text-xs font-bold w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(1.5, zoom + 0.15))}
            className="p-1.5 rounded-lg border hover:opacity-80"
            style={{ borderColor: theme.border }}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg border hover:opacity-80"
            style={{ borderColor: theme.border }}
            title="Reset Zoom"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Interactive Metro SVG Schematic Board */}
      <div
        className="relative rounded-2xl border overflow-hidden shadow-inner h-[580px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
        }}
      >
        {/* Subtle topological water body / geographic river background like Mini Metro */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <path
            d="M 0,280 C 250,220 500,340 750,260 C 900,210 1000,300 1200,280 L 1200,320 C 1000,340 900,250 750,300 C 500,380 250,260 0,320 Z"
            fill="#3B82F6"
          />
        </svg>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(${theme.stationStroke} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* SVG Network Map Canvas with Zoom transform */}
        <svg
          viewBox="0 0 950 600"
          className="w-full h-full max-w-[1000px] transition-transform duration-200"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Soft shadows for trains */}
            <filter id="metro-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Active Subway Line Tracks */}
          {habitRoutes.map(({ habit, pathD, completedStations }) => {
            if (!pathD || completedStations.length < 2) return null;

            return (
              <g key={`track-${habit.id}`}>
                {/* Outer casing */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={theme.cardBg}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main colored subway track */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={habit.color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />

                {/* Animated train carriage running along the track */}
                {isPlaying && completedStations.length >= 2 && (
                  <TrainCarriage
                    pathD={pathD}
                    color={habit.color}
                    progress={trainProgress}
                    theme={theme}
                  />
                )}
              </g>
            );
          })}

          {/* Station Nodes */}
          {stations.map((st) => {
            const rec = records[st.dateStr];
            const completedHabitList = activeHabits.filter(h =>
              rec?.completedHabitIds.includes(h.id)
            );
            const isSelected = selectedStationDate === st.dateStr;

            return (
              <g
                key={st.id}
                transform={`translate(${st.x}, ${st.y})`}
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedStationDate(st.dateStr);
                  onSelectDay(st.dateStr);
                }}
              >
                {/* Station Selection radar beacon */}
                {st.isToday && (
                  <circle
                    r="24"
                    fill="none"
                    stroke={theme.accent}
                    strokeWidth="2"
                    className="animate-metro-pulse"
                    opacity="0.6"
                  />
                )}

                {/* Outer station ring */}
                <circle
                  r={isSelected ? 18 : 14}
                  fill={theme.cardBg}
                  stroke={st.isToday ? theme.accent : theme.stationStroke}
                  strokeWidth="3"
                  className="transition-all duration-200 group-hover:scale-125"
                  filter="url(#metro-shadow)"
                />

                {/* Inner interchange hub indicator */}
                {completedHabitList.length > 0 ? (
                  <circle
                    r="8"
                    fill={completedHabitList[0].color}
                  />
                ) : (
                  <circle
                    r="4"
                    fill="none"
                    stroke={theme.textMuted}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Commuter queue dots waiting at station */}
                {completedHabitList.length > 1 && (
                  <g transform="translate(14, -14)">
                    {completedHabitList.slice(0, 3).map((h, i) => (
                      <circle
                        key={h.id}
                        cx={i * 6}
                        cy="0"
                        r="2.5"
                        fill={h.color}
                        stroke={theme.cardBg}
                        strokeWidth="1"
                      />
                    ))}
                  </g>
                )}

                {/* Station Label & Day */}
                <text
                  y="26"
                  textAnchor="middle"
                  className="font-mono text-[10px] font-bold select-none"
                  fill={theme.text}
                >
                  {st.label}
                </text>

                <text
                  y="37"
                  textAnchor="middle"
                  className="font-mono text-[9px] select-none"
                  fill={theme.textMuted}
                >
                  {completedHabitList.length}/{activeHabits.length} Lines
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay at bottom-left */}
        <div
          className="absolute bottom-3 left-3 p-3 rounded-xl border backdrop-blur-md font-mono text-xs shadow-md"
          style={{
            backgroundColor: theme.headerBg,
            borderColor: theme.border,
            color: theme.text,
          }}
        >
          <div className="font-bold text-[11px] uppercase mb-1.5 flex items-center gap-1.5" style={{ color: theme.textMuted }}>
            <Compass size={13} />
            <span>ACTIVE TRANSIT LINES</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {activeHabits.map((h) => {
              const activeCount = stations.filter(st => records[st.dateStr]?.completedHabitIds.includes(h.id)).length;
              return (
                <div key={h.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                  <span className="font-semibold">{h.name}:</span>
                  <span style={{ color: theme.textMuted }}>{activeCount} stops</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for an animated Mini Metro train carriage moving along SVG path
const TrainCarriage: React.FC<{
  pathD: string;
  color: string;
  progress: number;
  theme: ThemeConfig;
}> = ({ pathD, color, progress, theme }) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [trainPos, setTrainPos] = useState<{ x: number; y: number; angle: number } | null>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    try {
      const len = pathRef.current.getTotalLength();
      if (len > 0) {
        const curDist = len * progress;
        const pt = pathRef.current.getPointAtLength(curDist);
        const nextDist = Math.min(len, curDist + 4);
        const nextPt = pathRef.current.getPointAtLength(nextDist);
        const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);
        setTrainPos({ x: pt.x, y: pt.y, angle });
      }
    } catch {
      // SVG geometry fallback
    }
  }, [progress, pathD]);

  return (
    <>
      <path ref={pathRef} d={pathD} fill="none" stroke="transparent" />
      {trainPos && (
        <g
          transform={`translate(${trainPos.x}, ${trainPos.y}) rotate(${trainPos.angle})`}
          className="pointer-events-none"
        >
          {/* Mini Metro rectangular train carriage */}
          <rect
            x="-8"
            y="-4.5"
            width="16"
            height="9"
            rx="2.5"
            fill={theme.cardBg}
            stroke={color}
            strokeWidth="2.5"
          />
          {/* Windows / passengers */}
          <rect x="-4" y="-2" width="3" height="4" rx="0.5" fill={color} />
          <rect x="1" y="-2" width="3" height="4" rx="0.5" fill={color} />
        </g>
      )}
    </>
  );
};
