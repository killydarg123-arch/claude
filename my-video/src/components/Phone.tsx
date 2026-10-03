import React from "react";
import { Img, staticFile } from "remotion";
import {
  COLORS,
  PHONE,
  PHONE_SHADOW,
  SANS,
  SCREEN_RADIUS,
  STATUS_H,
} from "../theme";

const StatusBar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: STATUS_H,
      background: COLORS.white,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 52px 0 64px",
      boxSizing: "border-box",
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: 28,
      color: COLORS.ink,
    }}
  >
    <span>9:41</span>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
        {[9, 13, 17, 21].map((h) => (
          <div
            key={h}
            style={{ width: 5, height: h, borderRadius: 2, background: COLORS.ink }}
          />
        ))}
      </div>
      <div
        style={{
          width: 44,
          height: 22,
          borderRadius: 7,
          border: `2px solid ${COLORS.ink}`,
          opacity: 0.9,
          padding: 2,
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "80%", height: "100%", borderRadius: 4, background: COLORS.ink }} />
      </div>
    </div>
  </div>
);

// One app screenshot. The status bar covers the top so content can
// scroll underneath it.
export const Screen: React.FC<{
  readonly src: string;
  readonly scrollY?: number;
  readonly style?: React.CSSProperties;
}> = ({ src, scrollY = 0, style }) => (
  <div style={{ position: "absolute", inset: 0, background: COLORS.white, ...style }}>
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        top: STATUS_H,
        left: 0,
        width: "100%",
        translate: `0px ${scrollY}px`,
      }}
    />
    <StatusBar />
  </div>
);

export const Phone: React.FC<{
  readonly contentOpacity?: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ contentOpacity = 1, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: PHONE.left,
      top: PHONE.top,
      width: PHONE.width,
      height: PHONE.height,
      borderRadius: PHONE.radius,
      background: COLORS.ink,
      padding: PHONE.bezel,
      boxSizing: "border-box",
      boxShadow: PHONE_SHADOW,
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: PHONE.radius,
        boxShadow: "inset 0 0 0 3px #3A3A3C, inset 0 0 0 7px #0A0A0A",
      }}
    />
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: SCREEN_RADIUS,
        overflow: "hidden",
        background: "#000",
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: contentOpacity }}>
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          width: 196,
          height: 56,
          marginLeft: -98,
          borderRadius: 28,
          background: "#000",
        }}
      />
    </div>
  </div>
);

// Translucent circle that shows where a finger taps.
export const TapRipple: React.FC<{
  readonly frame: number;
  readonly at: number;
  readonly x: number;
  readonly y: number;
}> = ({ frame, at, x, y }) => {
  const t = (frame - at) / 18;
  if (t < 0 || t > 1) {
    return null;
  }
  const size = 96;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: "rgba(10,10,10,0.28)",
        border: "3px solid rgba(255,255,255,0.9)",
        scale: String(0.6 + t * 0.6),
        opacity: t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7,
      }}
    />
  );
};
