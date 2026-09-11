import { ReactNode } from "react";

export default function Marquee<T>({
  items,
  renderItem,
  duration = 26,
  reverse = false,
  pauseOnHover = false,
  className = "",
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex w-max gap-3 ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation: `${reverse ? "bbt-marquee-reverse" : "bbt-marquee"} ${duration}s linear infinite`,
        }}
      >
        {items.map((item, i) => (
          <div key={`a-${i}`}>{renderItem(item, i)}</div>
        ))}
        {items.map((item, i) => (
          <div key={`b-${i}`}>{renderItem(item, i)}</div>
        ))}
      </div>
    </div>
  );
}
