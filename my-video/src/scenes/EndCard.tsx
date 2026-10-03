import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BlurText } from "../components/BlurText";
import { ArrowUpRightIcon } from "../components/Icons";
import { clamp, smooth } from "../motion";
import { COLORS, SANS, SERIF } from "../theme";

const WORDMARK = "ONBARAKA";
const CTA_SIZE = 112;
const CTA_WIDTH = 500;

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaIn = smooth(frame, fps, 40, 14);
  const ctaOpen = smooth(frame, fps, 48, 20);
  const ctaLabel = smooth(frame, fps, 56, 14);
  const ctaWidth = interpolate(ctaOpen, [0, 1], [CTA_SIZE, CTA_WIDTH]);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        scale: String(interpolate(frame, [0, 110], [1, 1.03])),
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 128,
          letterSpacing: "0.02em",
          color: COLORS.ink,
          marginTop: -120,
        }}
      >
        {WORDMARK.split("").map((letter, i) => {
          const p = smooth(frame, fps, 4 + i * 2.5, 20);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
                translate: `0px ${(1 - p) * 40}px`,
                filter: `blur(${(1 - p) * 22}px)`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      <BlurText
        text="The app. Out now."
        delay={22}
        stagger={3}
        fontSize={50}
        fontWeight={500}
        color={COLORS.grey}
        style={{ marginTop: 20, letterSpacing: "-0.01em" }}
      />

      <div
        style={{
          marginTop: 90,
          width: ctaWidth,
          height: CTA_SIZE,
          borderRadius: CTA_SIZE / 2,
          background: COLORS.ink,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          opacity: ctaIn,
          scale: String(0.7 + ctaIn * 0.3),
          boxShadow: "0 30px 60px -24px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            color: COLORS.white,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            opacity: ctaLabel,
            filter: `blur(${(1 - ctaLabel) * 10}px)`,
          }}
        >
          Link in bio
          <ArrowUpRightIcon size={44} color={COLORS.white} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
