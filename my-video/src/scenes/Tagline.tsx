import React from "react";
import { AbsoluteFill } from "remotion";
import { BlurText } from "../components/BlurText";
import { COLORS } from "../theme";

export const Tagline: React.FC = () => {
  return (
    <AbsoluteFill
      style={{ background: COLORS.ink, justifyContent: "center", alignItems: "center" }}
    >
      <BlurText
        text={"Built for\n*presence.*"}
        delay={4}
        stagger={6}
        exitAt={78}
        fontSize={136}
        color={COLORS.white}
        glow
      />
    </AbsoluteFill>
  );
};
