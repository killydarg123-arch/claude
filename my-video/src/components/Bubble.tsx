import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SANS } from "../theme";
import { bouncy, clamp } from "../motion";

const VARIANTS = {
  ink: { background: COLORS.ink, color: COLORS.white },
  white: { background: COLORS.white, color: COLORS.ink },
  blue: { background: COLORS.blue, color: COLORS.white },
};

// A pill that pops out with a little overshoot, like a message bubble.
export const Bubble: React.FC<{
  readonly label: string;
  readonly icon: React.FC<{ size: number; color: string }>;
  readonly variant: keyof typeof VARIANTS;
  readonly x: number;
  readonly y: number;
  readonly tilt: number;
  readonly delay: number;
  readonly exitAt: number;
}> = ({ label, icon: Icon, variant, x, y, tilt, delay, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { background, color } = VARIANTS[variant];

  const pop = bouncy(frame, fps, delay);
  const exit = interpolate(frame, [exitAt, exitAt + 10], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "26px 42px 26px 34px",
        borderRadius: 999,
        background,
        color,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 42,
        letterSpacing: "-0.02em",
        boxShadow: "0 24px 50px -16px rgba(0,0,0,0.35)",
        opacity: interpolate(pop, [0, 0.4], [0, 1], clamp) * (1 - exit),
        scale: String(Math.max(0, pop) * (1 - exit * 0.15)),
        rotate: `${tilt * pop}deg`,
        translate: `0px ${(1 - pop) * 40 - exit * 30}px`,
        filter: `blur(${exit * 12}px)`,
      }}
    >
      <Icon size={40} color={color} />
      {label}
    </div>
  );
};
