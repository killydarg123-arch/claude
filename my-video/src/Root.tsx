import { Composition, Folder } from "remotion";
import "./theme";
import { LaunchAd } from "./LaunchAd";
import { EndCard } from "./scenes/EndCard";
import { Hook } from "./scenes/Hook";
import { Island } from "./scenes/Island";
import { PhoneTour } from "./scenes/PhoneTour";
import { Tagline } from "./scenes/Tagline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchAd"
        component={LaunchAd}
        durationInFrames={650}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="Scenes">
        <Composition
          id="Hook"
          component={Hook}
          durationInFrames={80}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Island"
          component={Island}
          durationInFrames={80}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="PhoneTour"
          component={PhoneTour}
          durationInFrames={290}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Tagline"
          component={Tagline}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="EndCard"
          component={EndCard}
          durationInFrames={110}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
    </>
  );
};
