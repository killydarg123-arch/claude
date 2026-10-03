import React from "react";
import { AbsoluteFill } from "remotion";
import { BlurText } from "../components/BlurText";
import { LIGHT_BG } from "../theme";

export const Hook: React.FC = () => {
  return (
    <AbsoluteFill
      style={{ background: LIGHT_BG, justifyContent: "center", alignItems: "center" }}
    >
      <BlurText
        text={"Your wardrobe\nhas a new *home.*"}
        delay={0}
        stagger={5}
        exitAt={66}
        fontSize={120}
      />
    </AbsoluteFill>
  );
};
