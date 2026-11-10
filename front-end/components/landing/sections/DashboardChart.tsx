import { ChartPoint } from "@/components/landing/landing.data";

interface DashboardChartProps {
  points: ChartPoint[];
  height?: number;
  label?: string;
}

export function DashboardChart({ points, height = 140, label }: DashboardChartProps) {
  if (!points || points.length === 0) return null;

  const n = points.length;
  const maxY = Math.max(30, Math.ceil(Math.max(...points.map((p) => p.y)) / 10) * 10);
  const width = 260;
  const left = 28;
  const right = 14;
  const top = 12;
  const bottom = height - 28;

  const px = (i: number) => left + (i / Math.max(n - 1, 1)) * (width - left - right);
  const py = (v: number) => bottom - (v / maxY) * (bottom - top);

  const line = points.map((p, i) => `${px(i)},${py(p.y)}`).join(" ");
  const area = `M${px(0)},${bottom} L${line} L${px(n - 1)},${bottom} Z`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label ?? "Andamento preventivi"}
    >
      <defs>
        <linearGradient id="prepo-area-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--prepo-primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--prepo-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Assi e griglia Y: 10 / 20 / 30 */}
      {[10, 20, 30].map((v) => (
        <g key={v}>
          <text
            x={10}
            y={py(v)}
            fontSize="10"
            fill="var(--prepo-text)"
            dominantBaseline="middle"
            className="text-prepo-text"
          >
            {v}
          </text>
          <line
            x1={left}
            x2={width - right}
            y1={py(v)}
            y2={py(v)}
            stroke="var(--prepo-border)"
            strokeWidth={1}
          />
        </g>
      ))}

      {/* Area sfumata + linea */}
      <path d={area} fill="url(#prepo-area-gradient)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--prepo-primary)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Punti dati */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={px(i)}
          cy={py(p.y)}
          r={3}
          fill="#FFFFFF"
          stroke="var(--prepo-primary)"
          strokeWidth={2}
        />
      ))}

      {/* Etichette X */}
      {points.map((p, i) => (
        <text
          key={`x-${i}`}
          x={px(i)}
          y={height - 6}
          fontSize="11"
          fill="var(--prepo-text)"
          textAnchor="middle"
          className="text-prepo-text"
        >
          {p.x}
        </text>
      ))}
    </svg>
  );
}
