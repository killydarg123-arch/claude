import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { BlurText } from "../components/BlurText";
import { useT } from "../motion";
import { LIGHT_BG } from "../theme";

export const Hook: React.FC = () => {
  const t = useT();

  return (
    <AbsoluteFill
      style={{ background: LIGHT_BG, justifyContent: "center", alignItems: "center" }}
    >
      <BlurText
        text={"Your wardrobe\nhas a new *home.*"}
        delay={0}
        stagger={5}
        exitAt={60}
        fontSize={120}
        style={{ scale: String(interpolate(t, [0, 76], [1, 1.05])) }}
      />
    </AbsoluteFill>
  );
};
