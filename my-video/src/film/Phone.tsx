import React from "react";
import { Img, staticFile } from "remotion";
import { COLORS, SANS } from "../theme";

// A generic modern phone drawn in code, in 1080x1920 frame coordinates.
// It sits low and runs off the bottom edge, like a product shot.
export const PHONE = {
  left: 172,
  top: 600,
  width: 736,
  height: 1490,
  radius: 112,
  bezel: 18,
};
export const SCREEN = {
  x: PHONE.left + PHONE.bezel,
  y: PHONE.top + PHONE.bezel,
  width: PHONE.width - PHONE.bezel * 2,
  height: PHONE.height - PHONE.bezel * 2,
  radius: PHONE.radius - PHONE.bezel,
};
export const STATUS_H = 76;

// Brushed titanium: dark body with bright catches at the corners.
const METAL =
  "linear-gradient(145deg, #9A9AA0 0%, #3A3A3D 14%, #1B1B1D 45%, #2A2A2D 70%, #8C8C92 100%)";

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
      padding: "18px 54px 0 66px",
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
          <div key={h} style={{ width: 5, height: h, borderRadius: 2, background: COLORS.ink }} />
        ))}
      </div>
      <div
        style={{
          width: 44,
          height: 22,
          borderRadius: 7,
          border: `2px solid ${COLORS.ink}`,
          padding: 2,
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "80%", height: "100%", borderRadius: 4, background: COLORS.ink }} />
      </div>
    </div>
  </div>
);

// One app screenshot filling the screen under the status bar.
export const AppScreen: React.FC<{
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

const Button: React.FC<{ side: "left" | "right"; top: number; height: number }> = ({
  side,
  top,
  height,
}) => (
  <div
    style={{
      position: "absolute",
      [side]: -5,
      top,
      width: 7,
      height,
      borderRadius: 3,
      background: METAL,
    }}
  />
);

export const Phone: React.FC<{
  readonly rotateX?: number;
  readonly rotateY?: number;
  readonly frameOpacity?: number;
  // The glass highlight; kept off while the screen fills the frame.
  readonly glass?: number;
  readonly children: React.ReactNode;
}> = ({ rotateX = 0, rotateY = 0, frameOpacity = 1, glass = 1, children }) => {
  const tilt = `perspective(2600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  return (
    <>
      {/* Soft contact shadow on the sweep. */}
      <div
        style={{
          position: "absolute",
          left: PHONE.left + 40 + rotateY * 4,
          top: PHONE.top + 120,
          width: PHONE.width - 80,
          height: PHONE.height,
          borderRadius: PHONE.radius,
          background: "rgba(0,0,0,0.28)",
          filter: "blur(60px)",
          opacity: frameOpacity * 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PHONE.left,
          top: PHONE.top,
          width: PHONE.width,
          height: PHONE.height,
          transform: tilt,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Back plate, pushed back in depth so a tilt reveals the edge. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: PHONE.radius,
            background: "linear-gradient(145deg, #5A5A5F, #151517 50%, #48484C)",
            transform: "translateZ(-16px)",
            opacity: frameOpacity,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: PHONE.radius,
            background: METAL,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.22)",
            opacity: frameOpacity,
          }}
        >
          <Button side="left" top={250} height={64} />
          <Button side="left" top={350} height={112} />
          <Button side="left" top={486} height={112} />
          <Button side="right" top={392} height={176} />
          <div
            style={{
              position: "absolute",
              inset: 5,
              borderRadius: PHONE.radius - 5,
              background: "#050505",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: PHONE.bezel,
            top: PHONE.bezel,
            width: SCREEN.width,
            height: SCREEN.height,
            borderRadius: SCREEN.radius,
            overflow: "hidden",
            background: COLORS.white,
          }}
        >
          {children}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "50%",
              width: 200,
              height: 58,
              marginLeft: -100,
              borderRadius: 29,
              background: "#000",
              opacity: frameOpacity,
            }}
          />
          {/* Glass: a faint highlight that slides as the phone turns. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(115deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 62%)",
              backgroundSize: "300% 100%",
              backgroundPosition: `${50 - rotateY * 5}% 0%`,
              mixBlendMode: "screen",
              opacity: glass * 0.8,
            }}
          />
        </div>
      </div>
    </>
  );
};
