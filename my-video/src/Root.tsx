import { Composition } from "remotion";
import "./theme";
import { Film } from "./film/Film";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="OnbarakaFilm"
      component={Film}
      durationInFrames={780}
      fps={60}
      width={1080}
      height={1920}
    />
  );
};
