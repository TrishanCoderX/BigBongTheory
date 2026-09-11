export default function BarChart({
  data,
  color = "#FF4D2E",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-2.5 h-[160px] px-1">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
          <div className="text-[10px] font-mono text-[#14141A]/60">{d.value}</div>
          <div
            className="w-full rounded-[2px] transition-[height]"
            style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, background: color }}
          />
          <div className="text-[9px] font-mono tracking-[0.08em] uppercase text-[#14141A]/45 text-center leading-tight">
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}
