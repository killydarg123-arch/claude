import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { BlurText } from "../components/BlurText";
import { glide, smooth, useT } from "../motion";
import { COLORS } from "../theme";

// The phone dive lands here on black. At the end a white pill grows from
// the centre until it fills the frame, handing over to the white end card.
export const Tagline: React.FC = () => {
  const t = useT();

  const pillIn = smooth(t, 68, 10);
  const fill = glide(t, 72, 18);

  return (
    <AbsoluteFill
      style={{ background: COLORS.ink, justifyContent: "center", alignItems: "center" }}
    >
      <BlurText
        text={"Built for\n*presence.*"}
        delay={0}
        stagger={6}
        exitAt={62}
        fontSize={136}
        color={COLORS.white}
        glow
        style={{ scale: String(interpolate(t, [0, 90], [1, 1.06])) }}
      />
      <div
        style={{
          position: "absolute",
          width: interpolate(fill, [0, 1], [220, 1240]),
          height: interpolate(fill, [0, 1], [64, 2080]),
          borderRadius: interpolate(fill, [0, 1], [32, 0]),
          background: COLORS.white,
          opacity: pillIn,
          scale: String(0.6 + pillIn * 0.4),
          filter: `blur(${(1 - pillIn) * 8}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
