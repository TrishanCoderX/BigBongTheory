const PALETTE = ["#CBF23F", "#FF4D2E", "#14141A", "#8C8C99"];

export default function DonutChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const total = Math.max(1, data.reduce((sum, d) => sum + d.value, 0));
  const r = 40;
  const c = 2 * Math.PI * r;
  const segments = data.reduce<{ label: string; dash: number; offset: number }[]>((acc, d) => {
    const dash = (d.value / total) * c;
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ label: d.label, dash, offset });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 100 100" className="w-[128px] h-[128px] -rotate-90 flex-none">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#14141A0F" strokeWidth="14" />
        {segments.map((seg, i) => (
          <circle
            key={seg.label}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth="14"
            strokeDasharray={`${seg.dash} ${c - seg.dash}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 flex-none" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="uppercase tracking-[0.06em] text-[#14141A]/70">{d.label}</span>
            <span className="text-[#14141A]/45">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
