import React from "react";
import { Series, useVideoConfig } from "remotion";
import { EndCard } from "./scenes/EndCard";
import { Hook } from "./scenes/Hook";
import { Island } from "./scenes/Island";
import { PhoneTour } from "./scenes/PhoneTour";
import { Tagline } from "./scenes/Tagline";

export const LaunchAd: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <Series>
      <Series.Sequence name="Hook" durationInFrames={80} premountFor={fps}>
        <Hook />
      </Series.Sequence>
      <Series.Sequence name="Island" durationInFrames={80} premountFor={fps}>
        <Island />
      </Series.Sequence>
      <Series.Sequence name="Phone tour" durationInFrames={290} premountFor={fps}>
        <PhoneTour />
      </Series.Sequence>
      <Series.Sequence name="Tagline" durationInFrames={90} premountFor={fps}>
        <Tagline />
      </Series.Sequence>
      <Series.Sequence name="End card" durationInFrames={110} premountFor={fps}>
        <EndCard />
      </Series.Sequence>
    </Series>
  );
};
