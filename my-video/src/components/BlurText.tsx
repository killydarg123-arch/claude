import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SANS, SERIF } from "../theme";
import { clamp } from "../motion";

type Props = {
  // "\n" breaks lines. Wrap a word in *asterisks* to set it in the serif.
  readonly text: string;
  readonly delay?: number;
  readonly stagger?: number;
  readonly exitAt?: number;
  readonly fontSize?: number;
  readonly fontWeight?: number;
  readonly color?: string;
  readonly glow?: boolean;
  readonly style?: React.CSSProperties;
};

// Words swing in one at a time with motion blur while the line drifts
// left, like a camera following the text.
export const BlurText: React.FC<Props> = ({
  text,
  delay = 0,
  stagger = 4,
  exitAt,
  fontSize = 112,
  fontWeight = 600,
  color = COLORS.ink,
  glow = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = text.split("\n").map((line) => line.split(" ").filter(Boolean));
  const wordCount = lines.flat().length;

  const camera = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: wordCount * stagger + 20,
  });

  let index = 0;

  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight,
        fontSize,
        color,
        letterSpacing: "-0.035em",
        lineHeight: 1.06,
        textAlign: "center",
        translate: `${(1 - camera) * fontSize * 0.9}px 0px`,
        ...style,
      }}
    >
      {lines.map((words, lineIndex) => (
        <div key={lineIndex} style={{ whiteSpace: "nowrap" }}>
          {words.map((raw, wordIndex) => {
            const i = index++;
            const serif = raw.startsWith("*") && raw.endsWith("*");
            const word = serif ? raw.slice(1, -1) : raw;
            const start = delay + i * stagger;

            const p = spring({
              frame: frame - start,
              fps,
              config: { damping: 200 },
              durationInFrames: 18,
            });
            const exit =
              exitAt === undefined
                ? 0
                : interpolate(frame, [exitAt + i, exitAt + i + 10], [0, 1], {
                    ...clamp,
                    easing: Easing.in(Easing.cubic),
                  });
            const glowAmount =
              glow && serif
                ? interpolate(frame, [start + 12, start + 36], [0, 1], clamp)
                : 0;

            return (
              <span
                key={wordIndex}
                style={{
                  display: "inline-block",
                  marginRight: wordIndex < words.length - 1 ? "0.24em" : 0,
                  opacity: interpolate(p, [0, 0.5], [0, 1], clamp) * (1 - exit),
                  transform: `perspective(${fontSize * 8}px) translate(${(1 - p) * fontSize * 0.8}px, ${(1 - p) * fontSize * 0.14 - exit * fontSize * 0.2}px) rotateY(${(1 - p) * -45}deg) scale(${1 - exit * 0.06})`,
                  filter: `blur(${(1 - p) * fontSize * 0.14 + exit * fontSize * 0.15}px)`,
                  textShadow:
                    glowAmount > 0
                      ? `0 0 ${glowAmount * 48}px rgba(255,255,255,${glowAmount * 0.55})`
                      : undefined,
                  ...(serif
                    ? {
                        fontFamily: SERIF,
                        fontWeight: 600,
                        fontSize: "1.1em",
                        letterSpacing: "-0.01em",
                      }
                    : {}),
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
