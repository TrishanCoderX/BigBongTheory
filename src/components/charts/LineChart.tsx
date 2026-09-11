export default function LineChart({
  data,
  color = "#3B7A20",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const w = 100;
  const h = 100;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: h - (d.value / max) * (h - 16) - 8,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[140px]">
        <path d={area} fill={color} opacity="0.12" />
        <path d={path} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.6" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between mt-1.5">
        {data.map((d) => (
          <div key={d.label} className="text-[9px] font-mono tracking-[0.08em] uppercase text-[#14141A]/45">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
