import React from "react";
import { interpolate } from "remotion";
import { CheckIcon, PlusIcon } from "./Icons";
import { bouncy, clamp, smooth, useT } from "../motion";
import { COLORS, SANS } from "../theme";

const SIZE = 140;
const OPEN_WIDTH = 660;

// A round + button gets tapped, morphs into "Add to your Baraka",
// then confirms. Same move as an iOS live activity expanding.
export const AddPill: React.FC<{
  readonly start: number;
  readonly x: number;
  readonly y: number;
}> = ({ start, x, y }) => {
  const f = useT() - start;

  const appear = bouncy(f, 0);
  const press = interpolate(f, [14, 18, 24], [1, 0.9, 1], clamp);
  const expand = smooth(f, 18, 18);
  const plusOut = interpolate(f, [18, 26], [0, 1], clamp);
  const addIn = smooth(f, 24, 14);
  const addOut = interpolate(f, [44, 52], [0, 1], clamp);
  const savedIn = smooth(f, 48, 14);
  const exit = interpolate(f, [84, 96], [0, 1], clamp);

  const width = interpolate(expand, [0, 1], [SIZE, OPEN_WIDTH]);

  const label: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    color: COLORS.white,
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 42,
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - SIZE / 2,
        width,
        height: SIZE,
        borderRadius: SIZE / 2,
        background: COLORS.blue,
        boxShadow: "0 30px 60px -20px rgba(11,29,58,0.6)",
        overflow: "hidden",
        opacity: interpolate(appear, [0, 0.4], [0, 1], clamp) * (1 - exit),
        scale: String(Math.max(0, appear) * press * (1 - exit * 0.12)),
        filter: `blur(${exit * 14}px)`,
      }}
    >
      <div
        style={{
          ...label,
          opacity: 1 - plusOut,
          rotate: `${plusOut * 90}deg`,
        }}
      >
        <PlusIcon size={64} color={COLORS.white} />
      </div>
      <div
        style={{
          ...label,
          opacity: addIn * (1 - addOut),
          filter: `blur(${(1 - addIn) * 10 + addOut * 10}px)`,
          translate: `0px ${(1 - addIn) * 16 - addOut * 16}px`,
        }}
      >
        Add to your Baraka
      </div>
      <div
        style={{
          ...label,
          opacity: savedIn,
          filter: `blur(${(1 - savedIn) * 10}px)`,
          translate: `0px ${(1 - savedIn) * 16}px`,
        }}
      >
        <CheckIcon size={44} color={COLORS.white} />
        Saved to Essentials
      </div>
    </div>
  );
};
