import React from "react";
import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";
import { BEAT_FPS } from "../motion";

// Original sounds made by sfx/generate.py.
export type SfxName =
  | "word-tick"
  | "serif-tock"
  | "tap"
  | "pop-low"
  | "pop-1"
  | "pop-2"
  | "pop-3"
  | "pop-cta"
  | "bloom"
  | "type"
  | "morph"
  | "swipe"
  | "expand"
  | "chime"
  | "dive"
  | "hit"
  | "shimmer"
  | "riser"
  | "sting";

// One sound effect, placed in 30fps beats like the visuals.
export const Sfx: React.FC<{
  readonly sound: SfxName;
  readonly at: number;
  readonly volume?: number;
}> = ({ sound, at, volume = 1 }) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      name={sound}
      src={staticFile(`sfx/${sound}.wav`)}
      from={Math.round((at * fps) / BEAT_FPS)}
      volume={volume}
      premountFor={fps}
    />
  );
};

// Ticks under each word of a BlurText headline. The serif word gets a
// rounder tock.
export const WordTicks: React.FC<{
  readonly text: string;
  readonly delay: number;
  readonly stagger: number;
  readonly volume?: number;
}> = ({ text, delay, stagger, volume = 0.3 }) => {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => {
        const serif = word.startsWith("*") && word.endsWith("*");
        return (
          <Sfx
            key={i}
            sound={serif ? "serif-tock" : "word-tick"}
            at={delay + i * stagger + 2}
            volume={serif ? volume * 1.5 : volume}
          />
        );
      })}
    </>
  );
};
