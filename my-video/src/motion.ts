import { spring } from "remotion";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Critically damped: eases in and settles with no overshoot.
export const smooth = (
  frame: number,
  fps: number,
  delay: number,
  durationInFrames = 18,
) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames,
  });

// Slight overshoot, like iOS Dynamic Island and button presses.
export const bouncy = (frame: number, fps: number, delay: number) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 170, mass: 0.9 },
  });
