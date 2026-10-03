import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AddPill } from "../components/AddPill";
import { BlurText } from "../components/BlurText";
import { Bubble } from "../components/Bubble";
import { BookmarkIcon, HeartIcon, SendIcon } from "../components/Icons";
import { Phone, Screen, TapRipple } from "../components/Phone";
import { clamp, smooth } from "../motion";
import { LIGHT_BG, SCREEN_WIDTH, STATUS_H } from "../theme";

const SCREEN_SCALE = SCREEN_WIDTH / 963;
// Centre of the WEAR toggle in the screenshot, in screen coordinates.
const WEAR_TOGGLE = { x: 130 * SCREEN_SCALE, y: 107 * SCREEN_SCALE + STATUS_H };

const Headline: React.FC<{
  readonly text: string;
  readonly delay: number;
  readonly exitAt: number;
}> = ({ text, delay, exitAt }) => (
  <AbsoluteFill
    style={{
      top: 170,
      height: 420,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <BlurText text={text} delay={delay} stagger={4} exitAt={exitAt} fontSize={108} />
  </AbsoluteFill>
);

// The phone takes over from the island and walks through three beats:
// For You, Wear (with reactions), and saving a piece to your Baraka.
export const PhoneTour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inOut = { ...clamp, easing: Easing.inOut(Easing.quad) };

  const settle = smooth(frame, fps, 0, 40);
  const rotateY = settle * interpolate(frame, [0, 250], [-7, 5], clamp);
  const rotateX = settle * 5;
  const exit = smooth(frame, fps, 266, 22);

  const contentIn = smooth(frame, fps, 2, 18);
  const push = smooth(frame, fps, 86, 22);

  return (
    <AbsoluteFill style={{ background: LIGHT_BG }}>
      <Phone
        contentOpacity={contentIn}
        style={{
          transform: `perspective(2600px) translateY(${exit * 1100}px) rotateX(${rotateX + exit * 20}deg) rotateY(${rotateY}deg)`,
        }}
      >
        <Screen
          src="screens/for-you.jpg"
          scrollY={interpolate(frame, [10, 100], [0, -40], inOut)}
          style={{
            filter: `blur(${(1 - contentIn) * 10}px) brightness(${1 - push * 0.15})`,
            scale: String(1.04 - contentIn * 0.04),
            translate: `${push * SCREEN_WIDTH * 0.3}px 0px`,
          }}
        />
        <TapRipple frame={frame} at={76} x={WEAR_TOGGLE.x} y={WEAR_TOGGLE.y} />
        <Screen
          src="screens/wear.jpg"
          scrollY={interpolate(frame, [110, 280], [0, -90], inOut)}
          style={{
            translate: `${(push - 1) * SCREEN_WIDTH}px 0px`,
            boxShadow: "20px 0 50px rgba(0,0,0,0.18)",
            opacity: push > 0 ? 1 : 0,
          }}
        />
      </Phone>

      <Headline text="Made for you." delay={12} exitAt={80} />
      <Headline text="See it worn." delay={96} exitAt={172} />
      <Headline text={"Add to your\n*Baraka.*"} delay={182} exitAt={262} />

      <Bubble
        label="Liked"
        icon={HeartIcon}
        variant="ink"
        x={70}
        y={980}
        tilt={-5}
        delay={110}
        exitAt={166}
      />
      <Bubble
        label="Saved"
        icon={BookmarkIcon}
        variant="white"
        x={620}
        y={1180}
        tilt={4}
        delay={120}
        exitAt={169}
      />
      <Bubble
        label="Shared"
        icon={SendIcon}
        variant="blue"
        x={110}
        y={1390}
        tilt={-3}
        delay={130}
        exitAt={172}
      />

      <AddPill start={188} x={540} y={1450} />
      <TapRipple frame={frame} at={200} x={540} y={1450} />
    </AbsoluteFill>
  );
};
