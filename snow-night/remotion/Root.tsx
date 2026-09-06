import { Composition } from "remotion";
import { SnowNightRemotion } from "./SnowNightRemotion";

export const RemotionRoot = () => (
  <Composition
    id="SnowNight"
    component={SnowNightRemotion}
    durationInFrames={360}
    fps={30}
    width={1920}
    height={1080}
  />
);
