import React from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useVideoConfig } from "remotion";
import { EndCard } from "./scenes/EndCard";
import { Hook } from "./scenes/Hook";
import { Island } from "./scenes/Island";
import { PhoneTour } from "./scenes/PhoneTour";
import { Tagline } from "./scenes/Tagline";

// Rendered at 60fps, so durations here are double the 30fps beats used
// inside each scene. Every handoff is a morph, not a cut.
export const LaunchAd: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Hook" durationInFrames={152} premountFor={fps}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 28 })}
      />
      <TransitionSeries.Sequence name="Island" durationInFrames={160} premountFor={fps}>
        <Island />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="Phone tour" durationInFrames={752} premountFor={fps}>
        <PhoneTour />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="Tagline" durationInFrames={180} premountFor={fps}>
        <Tagline />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="End card" durationInFrames={220} premountFor={fps}>
        <EndCard />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
