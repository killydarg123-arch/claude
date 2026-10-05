import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, SANS } from "../theme";
import { EASE, ramp, useSeconds } from "./time";

// One line of type, the way Apple sets it: the whole line rises a little
// and comes into focus, holds, then softly lets go. Times are in seconds.
export const Title: React.FC<{
  readonly text: string;
  readonly inAt: number;
  readonly outAt: number;
  readonly y: number;
  readonly size?: number;
  readonly weight?: number;
  readonly color?: string;
  readonly font?: string;
  readonly enterFor?: number;
  readonly leaveFor?: number;
}> = ({
  text,
  inAt,
  outAt,
  y,
  size = 92,
  weight = 600,
  color = COLORS.ink,
  font = SANS,
  enterFor = 1.0,
  leaveFor = 0.5,
}) => {
  const t = useSeconds();
  const enter = ramp(t, inAt, enterFor, EASE.out);
  const leave = ramp(t, outAt, leaveFor, EASE.in);

  if (enter === 0 || leave === 1) {
    return null;
  }

  return (
    <AbsoluteFill style={{ top: y - size, height: size * 2, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: font,
          fontWeight: weight,
          fontSize: size,
          letterSpacing: "-0.03em",
          color,
          whiteSpace: "nowrap",
          opacity: enter * (1 - leave),
          translate: `0px ${(1 - enter) * 28 - leave * 14}px`,
          filter: `blur(${(1 - enter) * 12 + leave * 8}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
