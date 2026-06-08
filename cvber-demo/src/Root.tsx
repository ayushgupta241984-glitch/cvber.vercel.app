import { Composition } from "remotion";
import { CvberDemo } from "./CvberDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CvberDemo"
      component={CvberDemo}
      durationInFrames={30 * 90}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
