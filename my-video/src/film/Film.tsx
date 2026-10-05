import React from "react";
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SANS, SERIF, STAGE_BG } from "../theme";
import { AppScreen, Phone, SCREEN, STATUS_H } from "./Phone";
import { Title } from "./Title";
import { EASE, mix, ramp, useSeconds } from "./time";

// Higgsfield clips (Wan 2.7 from the lookbook photos), slowed to 60fps.
const CLIP_LENGTH = 3.917;
const SOLO_AT = 1.85;
const DUO_AT = 5.05;

// The duo clip ends on the exact framing of the photo in the Wear screen:
// x 96 to 766, y 312 to 1504 of the 963px wide screenshot. The camera
// starts scaled so that rectangle fills the frame, then pulls back.
const SHOT_SCALE = SCREEN.width / 963;
const CROP = {
  x: 96 * SHOT_SCALE,
  y: STATUS_H + 312 * SHOT_SCALE,
  width: 670 * SHOT_SCALE,
  height: 1192 * SHOT_SCALE,
};
const CROP_CENTER = {
  x: SCREEN.x + CROP.x + CROP.width / 2,
  y: SCREEN.y + CROP.y + CROP.height / 2,
};
const START_ZOOM = Math.max(1080 / CROP.width, 1920 / CROP.height);
const PULL_AT = 8.7;
const PULL_LENGTH = 1.9;

const SWIPE_1 = 14.05;
const SWIPE_2 = 16.45;
const EXIT_AT = 18.6;

// Fine film grain, so flat colour never looks digital.
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.07, overflow: "hidden" }}>
      <Img
        src={staticFile(`grain/${frame % 6}.jpg`)}
        style={{
          position: "absolute",
          width: 1200,
          height: 2040,
          left: -((frame * 37) % 120),
          top: -((frame * 53) % 120),
        }}
      />
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const t = useSeconds();
  const mark = ramp(t, 19.35, 1.6, EASE.out);
  const cta = ramp(t, 20.75, 0.9, EASE.out);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          marginTop: -150,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 124,
          color: COLORS.ink,
          letterSpacing: `${mix(0.26, 0.04, mark)}em`,
          opacity: mark,
          filter: `blur(${(1 - mark) * 14}px)`,
          whiteSpace: "nowrap",
        }}
      >
        ONBARAKA
      </div>
      <Title text="The app. Out now." inAt={20.15} outAt={99} y={1010} size={46} weight={500} color={COLORS.grey} />
      <div
        style={{
          position: "absolute",
          top: 1150,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 38px",
          borderRadius: 999,
          border: `2px solid ${COLORS.ink}`,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 34,
          letterSpacing: "-0.01em",
          color: COLORS.ink,
          opacity: cta,
          translate: `0px ${(1 - cta) * 16}px`,
          filter: `blur(${(1 - cta) * 6}px)`,
        }}
      >
        Link in bio
        <svg width={30} height={30} viewBox="0 0 24 24">
          <path
            d="M7 17L17 7M8.5 7H17v8.5"
            fill="none"
            stroke={COLORS.ink}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const t = useSeconds();
  const { fps } = useVideoConfig();

  // Camera: hold on the photo rectangle, then pull back to reveal the phone.
  const pull = ramp(t, PULL_AT, PULL_LENGTH, EASE.inOut);
  const zoom = Math.pow(START_ZOOM, 1 - pull);
  const camera = `translate(${(1 - pull) * (540 - CROP_CENTER.x)}px, ${(1 - pull) * (960 - CROP_CENTER.y)}px) scale(${zoom})`;

  // Once settled the phone turns slowly and breathes, never fully still.
  const settle = ramp(t, PULL_AT + PULL_LENGTH - 0.2, 1.6, EASE.inOut);
  const exit = ramp(t, EXIT_AT, 1.2, EASE.in);
  const rotateY = interpolate(t, [10.6, 14.4, EXIT_AT], [0, 9, -7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const rotateX = settle * 4 + exit * 14;
  const float = settle * Math.sin((t - 10.6) * 0.9) * 8;

  // Solo to duo: a soft dip through the white studio with a focus pull,
  // rather than a double exposure.
  const soloOut = ramp(t, 5.0, 0.45, EASE.in);
  const duoIn = ramp(t, 5.3, 0.6, EASE.out);

  const swipe1 = ramp(t, SWIPE_1, 0.85);
  const swipe2 = ramp(t, SWIPE_2, 0.85);

  return (
    <AbsoluteFill style={{ background: STAGE_BG }}>
      <Title text="Built for presence." inAt={0.25} outAt={1.75} y={960} />

      <Sequence from={Math.round(SOLO_AT * fps)} durationInFrames={Math.round(4.2 * fps)} premountFor={fps}>
        <AbsoluteFill
          style={{
            opacity: ramp(t, SOLO_AT, 0.75, EASE.inOut) * (1 - soloOut),
            filter: soloOut > 0 ? `blur(${soloOut * 16}px)` : undefined,
          }}
        >
          <Video
            src={staticFile("clips/solo.mp4")}
            muted
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
              scale: String(mix(1.0, 1.05, ramp(t, SOLO_AT, 4.2, EASE.linear)) + soloOut * 0.04),
            }}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={Math.round(DUO_AT * fps)} premountFor={fps}>
        <AbsoluteFill
          style={{
            opacity: duoIn,
            filter: duoIn < 1 ? `blur(${(1 - duoIn) * 14}px)` : undefined,
            transform: camera,
            transformOrigin: `${CROP_CENTER.x}px ${CROP_CENTER.y}px`,
          }}
        >
          <AbsoluteFill style={{ translate: `0px ${exit * 1300 + float}px` }}>
            <Phone rotateX={rotateX} rotateY={rotateY} glass={settle}>
              <AppScreen
                src="screens/wear.jpg"
                scrollY={interpolate(t, [10.9, SWIPE_1], [0, -170], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: EASE.inOut,
                })}
                style={{
                  translate: `${-swipe1 * SCREEN.width * 0.3}px 0px`,
                  filter: `brightness(${1 - swipe1 * 0.12})`,
                }}
              />
              {/* The live shot sits exactly over the photo, then dissolves. */}
              <div
                style={{
                  position: "absolute",
                  left: CROP.x,
                  top: CROP.y,
                  width: CROP.width,
                  height: CROP.height,
                  opacity: 1 - ramp(t, 9.75, 0.6, EASE.inOut),
                }}
              >
                <Img
                  src={staticFile("clips/duo-last.jpg")}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Sequence durationInFrames={Math.round(CLIP_LENGTH * fps) - 1} layout="none">
                  <Video
                    src={staticFile("clips/duo-pullback.mp4")}
                    muted
                    objectFit="cover"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  />
                </Sequence>
              </div>
              <AppScreen
                src="screens/for-you.jpg"
                scrollY={interpolate(t, [14.4, 16.6], [0, -60], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: EASE.inOut,
                })}
                style={{
                  translate: `${(1 - swipe1) * SCREEN.width - swipe2 * SCREEN.width * 0.3}px 0px`,
                  filter: `brightness(${1 - swipe2 * 0.12})`,
                  boxShadow: "-20px 0 50px rgba(0,0,0,0.16)",
                  opacity: swipe1 > 0 ? 1 : 0,
                }}
              />
              <AppScreen
                src="screens/wishlist.jpg"
                style={{
                  translate: `${(1 - swipe2) * SCREEN.width}px 0px`,
                  boxShadow: "-20px 0 50px rgba(0,0,0,0.16)",
                  opacity: swipe2 > 0 ? 1 : 0,
                }}
              />
            </Phone>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>

      <Title text="Now in your pocket." inAt={10.3} outAt={12.35} y={360} size={88} />
      <Title text="See it worn." inAt={12.75} outAt={13.95} y={360} size={88} />
      <Title text="Made for you." inAt={14.7} outAt={16.3} y={360} size={88} />
      <Title text="Keep what moves you." inAt={17.1} outAt={18.45} y={360} size={88} />

      <AbsoluteFill style={{ background: COLORS.white, opacity: ramp(t, 18.95, 0.9, EASE.inOut) }} />
      <EndCard />

      <Grain />
      <Audio src={staticFile("audio/film.wav")} />
    </AbsoluteFill>
  );
};
