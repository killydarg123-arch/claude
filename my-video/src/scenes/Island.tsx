import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { ArrowUpRightIcon } from "../components/Icons";
import { bouncy, clamp, smooth, useT } from "../motion";
import { COLORS, LIGHT_BG, PHONE, PHONE_SHADOW, SANS } from "../theme";

const CLOSED = { width: 220, height: 64 };
const OPEN = { width: 860, height: 214 };
// Same height as the hook text, so the words dissolve into the pill.
const CENTER_Y = 960;
const STATUS = "Now live";

// A Dynamic Island pill opens into a live activity, then stretches into
// the exact shape of the phone so the next scene can cut in seamlessly.
export const Island: React.FC = () => {
  const frame = useT();

  const appear = smooth(frame, 0, 14);
  const open = bouncy(frame, 10);
  const toPhone = smooth(frame, 56, 22);

  const pillWidth = interpolate(open, [0, 1], [CLOSED.width, OPEN.width]);
  const pillHeight = interpolate(open, [0, 1], [CLOSED.height, OPEN.height]);
  const width = interpolate(toPhone, [0, 1], [pillWidth, PHONE.width]);
  const height = interpolate(toPhone, [0, 1], [pillHeight, PHONE.height]);
  const radius = interpolate(toPhone, [0, 1], [pillHeight / 2, PHONE.radius]);
  const centerY = interpolate(
    toPhone,
    [0, 1],
    [CENTER_Y, PHONE.top + PHONE.height / 2],
  );

  const contentIn = smooth(frame, 24, 16);
  const contentOut = interpolate(frame, [50, 58], [0, 1], clamp);
  const typed = Math.floor(interpolate(frame, [32, 46], [0, STATUS.length], clamp));
  const button = bouncy(frame, 30);

  return (
    <AbsoluteFill style={{ background: LIGHT_BG }}>
      <div
        style={{
          position: "absolute",
          left: 540 - width / 2,
          top: centerY - height / 2,
          width,
          height,
          borderRadius: radius,
          background: COLORS.ink,
          overflow: "hidden",
          boxShadow: PHONE_SHADOW,
          opacity: appear,
          scale: String(0.6 + appear * 0.4),
          filter: `blur(${(1 - appear) * 10}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            boxShadow: "inset 0 0 0 3px #3A3A3C, inset 0 0 0 7px #0A0A0A",
            opacity: toPhone,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: OPEN.width,
            height: OPEN.height,
            marginLeft: -OPEN.width / 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 44px 0 64px",
            boxSizing: "border-box",
            fontFamily: SANS,
            opacity: contentIn * (1 - contentOut),
            filter: `blur(${(1 - contentIn) * 8 + contentOut * 10}px)`,
            translate: `0px ${(1 - contentIn) * 14}px`,
          }}
        >
          <div>
            <div
              style={{
                color: COLORS.white,
                fontWeight: 600,
                fontSize: 66,
                letterSpacing: "-0.03em",
              }}
            >
              Onbaraka
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 6,
                color: COLORS.lightGrey,
                fontWeight: 500,
                fontSize: 42,
                letterSpacing: "-0.01em",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: COLORS.white,
                  opacity: 0.55 + 0.45 * Math.sin(frame / 4),
                }}
              />
              {STATUS.slice(0, typed)}
            </div>
          </div>
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 64,
              background: COLORS.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: String(Math.max(0, button)),
            }}
          >
            <ArrowUpRightIcon size={56} color={COLORS.ink} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
