import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, SANS, SERIF, STAGE_BG } from "../theme";
import { AppScreen, Phone, SCREEN } from "./Phone";
import { Title } from "./Title";
import { EASE, mix, ramp, useSeconds } from "./time";

// Everything cuts on the beat of the 140 BPM score (sfx/film_audio.py).
export const BPM = 140;
const BEAT = 60 / BPM;
const b = (n: number) => n * BEAT;

const DROP = b(4);
const SWIPE_TO_WEAR = b(10);
const SWIPE_TO_WISHLIST = b(14);
const WHIP = b(18);
const LOGO = b(20);

type Camera = {
  zoom: number;
  // Point on the frame that the camera centres on when zoomed.
  focusX: number;
  focusY: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  x: number;
  y: number;
  blur: number;
};

const still = (overrides: Partial<Camera>): Camera => ({
  zoom: 1,
  focusX: 540,
  focusY: 960,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  x: 0,
  y: 0,
  blur: 0,
  ...overrides,
});

// One framing per two beats: wide with a headline, then a tight punch in
// on the screen. Each shot keeps drifting so nothing ever sits dead still.
const cameraAt = (t: number): Camera => {
  if (t < b(8)) {
    const land = ramp(t, DROP, 0.62, EASE.out);
    const drift = ramp(t, DROP, b(4), EASE.linear);
    return still({
      zoom: 1 + 0.03 * drift,
      rotateX: mix(24, 6, land),
      rotateY: mix(32, 10, land) - 4 * drift,
      rotateZ: mix(-18, -2, land),
      y: mix(1250, 0, land),
      blur: 18 * (1 - land) ** 2,
    });
  }
  const shotDrift = (from: number) => ramp(t, b(from), b(2), EASE.linear);
  if (t < b(10)) {
    const d = shotDrift(8);
    return still({ zoom: mix(1.85, 1.97, d), focusX: 425, focusY: 950, rotateY: mix(3, -1, d) });
  }
  if (t < b(12)) {
    const d = shotDrift(10);
    return still({ zoom: mix(1, 1.04, d), rotateX: 5, rotateY: mix(-15, -10, d), rotateZ: 2 });
  }
  if (t < b(14)) {
    const d = shotDrift(12);
    return still({ zoom: mix(2.05, 2.2, d), focusY: 1375, rotateZ: mix(0, 1.5, d) });
  }
  if (t < b(16)) {
    const d = shotDrift(14);
    return still({ zoom: mix(1.02, 1.06, d), rotateX: 8, rotateY: mix(13, 9, d), rotateZ: -2 });
  }
  if (t < WHIP) {
    const d = shotDrift(16);
    return still({ zoom: mix(1.8, 1.92, d), focusX: 440, focusY: 985, rotateZ: mix(-4, -2.5, d) });
  }
  const out = ramp(t, WHIP, b(1), EASE.in);
  return still({
    rotateX: 6,
    rotateY: mix(9, 80, out),
    rotateZ: mix(-2, -12, out),
    x: mix(0, -1400, out),
    blur: 22 * out,
  });
};

// A full screen word that slams in on its beat.
const Word: React.FC<{
  readonly text: string;
  readonly at: number;
  readonly until: number;
  readonly dark: boolean;
  readonly serif?: boolean;
}> = ({ text, at, until, dark, serif = false }) => {
  const t = useSeconds();
  if (t < at || t >= until) {
    return null;
  }
  const hit = ramp(t, at, 0.24, EASE.out);
  const hold = ramp(t, at, until - at, EASE.linear);
  return (
    <AbsoluteFill
      style={{
        background: dark ? COLORS.ink : COLORS.white,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: serif ? SERIF : SANS,
          fontWeight: 700,
          fontSize: serif ? 176 : 230,
          letterSpacing: serif ? "-0.01em" : "-0.045em",
          color: dark ? COLORS.white : COLORS.ink,
          scale: String(mix(1.14, 1, hit) + 0.05 * hold),
          filter: `blur(${(1 - hit) * 10}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ readonly at: number; readonly strength: number }> = ({ at, strength }) => {
  const t = useSeconds();
  const fade = ramp(t, at, 0.16, EASE.out);
  if (t < at || fade >= 1) {
    return null;
  }
  return <AbsoluteFill style={{ background: COLORS.white, opacity: strength * (1 - fade) }} />;
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.06, overflow: "hidden" }}>
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

// Screens push in from the right, fast, with a touch of blur mid move.
const swipe = (t: number, at: number) => ramp(t, at, 0.38, EASE.out);
const swipeBlur = (p: number) => 7 * Math.sin(Math.PI * p);

const Stage: React.FC = () => {
  const t = useSeconds();
  if (t < DROP || t >= b(19.2)) {
    return null;
  }
  const cam = cameraAt(t);
  const toWear = swipe(t, SWIPE_TO_WEAR);
  const toWishlist = swipe(t, SWIPE_TO_WISHLIST);
  const width = SCREEN.width;

  return (
    <AbsoluteFill style={{ background: STAGE_BG, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${cam.focusX}px ${cam.focusY}px`,
          transform: `translate(${cam.x + 540 - cam.focusX}px, ${cam.y + 960 - cam.focusY}px) scale(${cam.zoom})`,
        }}
      >
        <Phone
          rotateX={cam.rotateX}
          rotateY={cam.rotateY}
          rotateZ={cam.rotateZ}
          blur={cam.blur}
        >
          <AppScreen
            src="screens/for-you.jpg"
            scrollY={interpolate(t, [DROP, SWIPE_TO_WEAR], [0, -40], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
            style={{
              translate: `${-toWear * width * 0.3}px 0px`,
              filter: `brightness(${1 - toWear * 0.12}) blur(${swipeBlur(toWear)}px)`,
            }}
          />
          <AppScreen
            src="screens/wear.jpg"
            style={{
              translate: `${(1 - toWear) * width - toWishlist * width * 0.3}px 0px`,
              filter: `brightness(${1 - toWishlist * 0.12}) blur(${swipeBlur(toWear) + swipeBlur(toWishlist)}px)`,
              boxShadow: "-20px 0 50px rgba(0,0,0,0.16)",
              opacity: toWear > 0 ? 1 : 0,
            }}
          />
          <AppScreen
            src="screens/wishlist.jpg"
            style={{
              translate: `${(1 - toWishlist) * width}px 0px`,
              filter: `blur(${swipeBlur(toWishlist)}px)`,
              boxShadow: "-20px 0 50px rgba(0,0,0,0.16)",
              opacity: toWishlist > 0 ? 1 : 0,
            }}
          />
        </Phone>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const t = useSeconds();
  if (t < b(19)) {
    return null;
  }
  const slam = ramp(t, LOGO, 0.42, EASE.out);
  const cta = ramp(t, b(24), 0.35, EASE.out);
  const push = ramp(t, LOGO, b(10), EASE.linear);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.ink,
        alignItems: "center",
        justifyContent: "center",
        scale: String(1 + 0.04 * push),
      }}
    >
      {t >= LOGO ? (
        <div
          style={{
            marginTop: -150,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 128,
            letterSpacing: "0.06em",
            color: COLORS.white,
            whiteSpace: "nowrap",
            opacity: Math.min(1, slam * 4),
            scale: String(mix(1.3, 1, slam)),
            filter: `blur(${(1 - slam) * 18}px)`,
          }}
        >
          ONBARAKA
        </div>
      ) : null}
      <Title
        text="The app. Out now."
        inAt={b(22)}
        outAt={99}
        y={1010}
        size={48}
        weight={500}
        color="#A1A1A6"
        enterFor={0.35}
      />
      <div
        style={{
          position: "absolute",
          top: 1150,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 38px",
          borderRadius: 999,
          border: `2px solid ${COLORS.white}`,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 34,
          letterSpacing: "-0.01em",
          color: COLORS.white,
          opacity: cta,
          translate: `0px ${(1 - cta) * 24}px`,
          filter: `blur(${(1 - cta) * 6}px)`,
        }}
      >
        Link in bio
        <svg width={30} height={30} viewBox="0 0 24 24">
          <path
            d="M7 17L17 7M8.5 7H17v8.5"
            fill="none"
            stroke={COLORS.white}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const FAST = { enterFor: 0.3, leaveFor: 0.18 };

export const Film: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      <Word text="Built" at={-0.12} until={b(1)} dark={false} />
      <Word text="for" at={b(1)} until={b(2)} dark />
      <Word text="presence." at={b(2)} until={DROP} dark={false} serif />

      <Stage />
      <Title text="Now in your pocket." inAt={b(4.6)} outAt={b(7.6)} y={360} size={88} {...FAST} />
      <Title text="See it worn." inAt={b(10.3)} outAt={b(11.6)} y={360} size={88} {...FAST} />
      <Title text="Keep what moves you." inAt={b(14.3)} outAt={b(15.6)} y={360} size={88} {...FAST} />

      <EndCard />
      <Flash at={DROP} strength={0.85} />
      <Flash at={LOGO} strength={0.45} />

      <Grain />
      <Audio src={staticFile("audio/film.wav")} />
    </AbsoluteFill>
  );
};
