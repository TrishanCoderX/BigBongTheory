"use client";

import { useReveal } from "@/hooks/useReveal";
import { ElementType, ReactNode } from "react";

export default function Reveal({
  children,
  as = "div",
  axis = "y",
  className = "",
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  axis?: "x" | "y";
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useReveal<HTMLElement>();
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : axis === "x" ? "translateX(70px)" : "translateY(52px)",
        transition: "opacity .9s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {children}
    </Tag>
  );
}
