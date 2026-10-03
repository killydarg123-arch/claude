import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Scene timings are written in 30fps beats. useT converts the real frame
// into that clock, so the ad renders at 60fps without retiming anything.
export const BEAT_FPS = 30;

export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * BEAT_FPS) / fps;
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Critically damped: eases in and settles with no overshoot.
export const smooth = (t: number, delay: number, durationInFrames = 18) =>
  spring({
    frame: t - delay,
    fps: BEAT_FPS,
    config: { damping: 200 },
    durationInFrames,
  });

// Slight overshoot, like iOS Dynamic Island and button presses.
export const bouncy = (t: number, delay: number) =>
  spring({
    frame: t - delay,
    fps: BEAT_FPS,
    config: { damping: 14, stiffness: 170, mass: 0.9 },
  });

// The iOS sheet curve: quick start, long soft landing.
const IOS_EASE = Easing.bezier(0.32, 0.72, 0, 1);

export const glide = (t: number, start: number, duration: number) =>
  interpolate(t, [start, start + duration], [0, 1], {
    ...clamp,
    easing: IOS_EASE,
  });
