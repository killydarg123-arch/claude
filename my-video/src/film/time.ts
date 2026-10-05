import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// The film is timed in seconds so every move reads like an edit decision,
// independent of frame rate.
export const useSeconds = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

// Apple's motion leans on long, soft curves. No springs, no overshoot.
export const EASE = {
  // Gentle settle for things arriving.
  out: Easing.bezier(0.16, 1, 0.3, 1),
  // Symmetric glide for camera moves and screen changes.
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  // Quiet departure.
  in: Easing.bezier(0.5, 0, 0.75, 0),
  linear: (x: number) => x,
};

// 0 to 1 over [start, start + duration], eased and clamped.
export const ramp = (
  t: number,
  start: number,
  duration: number,
  easing: (x: number) => number = EASE.inOut,
) =>
  interpolate(t, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
