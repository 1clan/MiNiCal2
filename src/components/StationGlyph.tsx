import type { StationShape } from '../types/metro';

interface StationGlyphProps {
  shape: StationShape;
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  passengers?: number; // small commuter dots queuing at station
  pulse?: boolean;
}

export const StationGlyph: React.FC<StationGlyphProps> = ({
  shape,
  size = 24,
  fill = '#FFFFFF',
  stroke = '#22252A',
  strokeWidth = 2.5,
  className = '',
  passengers = 0,
  pulse = false,
}) => {
  const half = size / 2;
  const padding = strokeWidth + 1;
  const r = half - padding;

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return <circle cx={half} cy={half} r={r} />;

      case 'square': {
        const side = r * 1.55;
        const offset = (size - side) / 2;
        return <rect x={offset} y={offset} width={side} height={side} rx={2} />;
      }

      case 'triangle': {
        const p1 = `${half},${padding}`;
        const p2 = `${size - padding},${size - padding * 1.2}`;
        const p3 = `${padding},${size - padding * 1.2}`;
        return <polygon points={`${p1} ${p2} ${p3}`} strokeLinejoin="round" />;
      }

      case 'diamond': {
        const p1 = `${half},${padding}`;
        const p2 = `${size - padding},${half}`;
        const p3 = `${half},${size - padding}`;
        const p4 = `${padding},${half}`;
        return <polygon points={`${p1} ${p2} ${p3} ${p4}`} strokeLinejoin="round" />;
      }

      case 'cross': {
        const w = r * 0.55;
        const h = r * 1.6;
        const ox = (size - w) / 2;
        const oy = (size - h) / 2;
        return (
          <g>
            <rect x={ox} y={oy} width={w} height={h} rx={1.5} />
            <rect x={oy} y={ox} width={h} height={w} rx={1.5} />
          </g>
        );
      }

      case 'pentagon': {
        const points: string[] = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = half + r * Math.cos(angle);
          const py = half + r * Math.sin(angle);
          points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
        return <polygon points={points.join(' ')} strokeLinejoin="round" />;
      }

      case 'star': {
        const points: string[] = [];
        const innerR = r * 0.46;
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const currentR = i % 2 === 0 ? r : innerR;
          const px = half + currentR * Math.cos(angle);
          const py = half + currentR * Math.sin(angle);
          points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
        return <polygon points={points.join(' ')} strokeLinejoin="round" />;
      }

      default:
        return <circle cx={half} cy={half} r={r} />;
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {pulse && (
        <span
          className="absolute inset-0 rounded-full animate-metro-pulse"
          style={{
            border: `2px solid ${stroke}`,
            transform: 'scale(1.25)',
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          {renderShape()}
        </g>
      </svg>

      {/* Mini Metro commuters queuing (up to 4 small dots) */}
      {passengers > 0 && (
        <div className="absolute -top-1 -right-2 flex space-x-0.5">
          {Array.from({ length: Math.min(passengers, 4) }).map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: stroke }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
