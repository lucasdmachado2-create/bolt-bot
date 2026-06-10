interface Props {
  value: number; // 0-100
  label: string;
  sublabel?: string;
  segments?: { from: number; to: number; color: string; label: string }[];
}

const defaultSegments = [
  { from: 0, to: 25, color: "var(--bear)", label: "Medo Extremo" },
  { from: 25, to: 45, color: "var(--warn)", label: "Medo" },
  { from: 45, to: 55, color: "var(--muted-foreground)", label: "Neutro" },
  { from: 55, to: 75, color: "var(--bull)", label: "Ganância" },
  { from: 75, to: 100, color: "var(--info)", label: "Extrema" },
];

export function Gauge({ value, label, sublabel, segments = defaultSegments }: Props) {
  const v = Math.max(0, Math.min(100, value));
  // semicircle arc: -90 -> 90 deg
  const angle = -90 + (v / 100) * 180;
  const radius = 80;
  const cx = 100, cy = 100;
  const current = segments.find(s => v >= s.from && v <= s.to) ?? segments[2];

  const arcs = segments.map((s) => {
    const a0 = -Math.PI + (s.from / 100) * Math.PI;
    const a1 = -Math.PI + (s.to / 100) * Math.PI;
    const x0 = cx + radius * Math.cos(a0), y0 = cy + radius * Math.sin(a0);
    const x1 = cx + radius * Math.cos(a1), y1 = cy + radius * Math.sin(a1);
    return { ...s, d: `M ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1}` };
  });

  const rad = (angle * Math.PI) / 180;
  const nx = cx + (radius - 6) * Math.cos(rad);
  const ny = cy + (radius - 6) * Math.sin(rad);

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
          {sublabel && <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold tabular leading-none">{Math.round(v)}</div>
          <div className="text-[11px] mt-1" style={{ color: current.color }}>{current.label}</div>
        </div>
      </div>
      <svg viewBox="0 0 200 115" className="w-full mt-2">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
        ))}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--foreground)" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill="var(--foreground)" />
      </svg>
    </div>
  );
}
