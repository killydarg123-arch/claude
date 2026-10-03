import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { AddPill } from "../components/AddPill";
import { BlurText } from "../components/BlurText";
import { Bubble } from "../components/Bubble";
import { ChatIcon, HeartIcon, SendIcon } from "../components/Icons";
import { Phone, Screen, TapRipple } from "../components/Phone";
import { Sfx, WordTicks } from "../components/Sfx";
import { clamp, glide, smooth, useT } from "../motion";
import { LIGHT_BG, PHONE, SCREEN_WIDTH, STATUS_H } from "../theme";

// Centre of "Browse the collection" in the wishlist screenshot (966px wide),
// in screen coordinates.
const BROWSE = {
  x: 381 * (SCREEN_WIDTH / 966),
  y: 947 * (SCREEN_WIDTH / 966) + STATUS_H,
};

// Moving the phone's centre to the frame's centre, then scaling until the
// screen fills the frame, so the dive lands on the black tagline scene.
const DIVE_Y = 960 - (PHONE.top + PHONE.height / 2);
const DIVE_SCALE = 2.7;

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
    <WordTicks text={text} delay={delay} stagger={4} volume={0.22} />
  </AbsoluteFill>
);

// The phone takes over from the island and walks through four beats:
// For You, the empty wishlist, browsing the lookbook, and saving a piece.
// Each screen pushes in from the right with the iOS curve. Timings are
// in 30fps beats.
export const PhoneTour: React.FC = () => {
  const t = useT();
  const inOut = { ...clamp, easing: Easing.inOut(Easing.quad) };

  const settle = smooth(t, 0, 40);
  // Ease in and out, so the camera visibly falls into the screen.
  const dive = interpolate(t, [344, 374], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const drift = settle * (1 - dive);
  const rotateY = drift * interpolate(t, [0, 344], [-7, 5], clamp);
  const rotateX = drift * 5;
  const float = drift * Math.sin(t / 28) * 8;

  const contentIn = smooth(t, 2, 20);
  const toWishlist = glide(t, 80, 26);
  const toWear = glide(t, 158, 26);
  const toBlack = interpolate(dive, [0.45, 0.95], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: LIGHT_BG }}>
      <Phone
        contentOpacity={contentIn}
        style={{
          transform: `translateY(${dive * DIVE_Y + float}px) perspective(2600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${1 + dive * (DIVE_SCALE - 1)})`,
        }}
      >
        <Screen
          src="screens/for-you.jpg"
          scrollY={interpolate(t, [10, 96], [0, -40], inOut)}
          style={{
            filter: `blur(${(1 - contentIn) * 10}px) brightness(${1 - toWishlist * 0.15})`,
            scale: String(1.04 - contentIn * 0.04),
            translate: `${-toWishlist * SCREEN_WIDTH * 0.3}px 0px`,
          }}
        />
        <Screen
          src="screens/wishlist.jpg"
          style={{
            translate: `${(1 - toWishlist) * SCREEN_WIDTH - toWear * SCREEN_WIDTH * 0.3}px 0px`,
            filter: `brightness(${1 - toWear * 0.15})`,
            boxShadow: "-20px 0 50px rgba(0,0,0,0.18)",
            opacity: toWishlist > 0 ? 1 : 0,
          }}
        />
        <TapRipple t={t} at={146} x={BROWSE.x} y={BROWSE.y} />
        <Screen
          src="screens/wear.jpg"
          scrollY={interpolate(t, [170, 344], [0, -90], inOut)}
          style={{
            translate: `${(1 - toWear) * SCREEN_WIDTH}px 0px`,
            boxShadow: "-20px 0 50px rgba(0,0,0,0.18)",
            opacity: toWear > 0 ? 1 : 0,
          }}
        />
        <AbsoluteFill style={{ background: "#000", opacity: toBlack }} />
      </Phone>

      <Headline text="Made for you." delay={10} exitAt={74} />
      <Headline text={"Keep what\n*moves* you."} delay={84} exitAt={152} />
      <Headline text="See it worn." delay={162} exitAt={236} />
      <Headline text={"Add to your\n*Baraka.*"} delay={244} exitAt={336} />

      <Bubble
        label="Liked"
        icon={HeartIcon}
        variant="ink"
        x={70}
        y={980}
        tilt={-5}
        delay={176}
        exitAt={230}
      />
      <Bubble
        label="Need this."
        icon={ChatIcon}
        variant="white"
        x={560}
        y={1180}
        tilt={4}
        delay={186}
        exitAt={233}
      />
      <Bubble
        label="Shared"
        icon={SendIcon}
        variant="blue"
        x={110}
        y={1390}
        tilt={-3}
        delay={196}
        exitAt={236}
      />

      <AddPill start={252} x={540} y={1450} />
      <TapRipple t={t} at={264} x={540} y={1450} />

      <Sfx sound="swipe" at={79} volume={0.55} />
      <Sfx sound="tap" at={146} volume={0.6} />
      <Sfx sound="swipe" at={157} volume={0.55} />
      <Sfx sound="pop-1" at={177} volume={0.5} />
      <Sfx sound="pop-2" at={187} volume={0.5} />
      <Sfx sound="pop-3" at={197} volume={0.5} />
      <Sfx sound="pop-2" at={253} volume={0.45} />
      <Sfx sound="tap" at={265} volume={0.6} />
      <Sfx sound="expand" at={270} volume={0.45} />
      <Sfx sound="chime" at={300} volume={0.3} />
      <Sfx sound="dive" at={336} volume={0.75} />
    </AbsoluteFill>
  );
};
