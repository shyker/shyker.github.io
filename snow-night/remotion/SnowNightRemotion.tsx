import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const flakes = Array.from({ length: 230 }, (_, index) => {
  const seed = Math.sin(index * 91.73) * 10000;
  const rand = seed - Math.floor(seed);
  const seedB = Math.sin(index * 37.21 + 8) * 10000;
  const randB = seedB - Math.floor(seedB);
  return {
    left: (index * 37 + rand * 73) % 100,
    top: -20 - randB * 100,
    size: index % 9 === 0 ? 7 + rand * 9 : 2 + rand * 4,
    speed: 86 + randB * 62,
    drift: -36 - rand * 52,
    opacity: 0.32 + rand * 0.56,
    blur: index % 7 === 0 ? 2.2 : 0.4,
  };
});

const ghostOpacity = (frame: number, start: number, end: number) => {
  if (frame < start || frame > end) return 0;
  const local = (frame - start) / (end - start);
  return Math.sin(local * Math.PI) * 0.36;
};

export const SnowNightRemotion = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1, 1.055]);
  const lamp =
    0.78 +
    Math.sin(frame * 0.13) * 0.08 -
    Math.exp(-Math.pow((frame - 106) / 5, 2)) * 0.42 -
    Math.exp(-Math.pow((frame - 214) / 7, 2)) * 0.28;
  const roadPulse = Math.max(0.38, lamp);

  return (
    <AbsoluteFill className="remotion-scene">
      <Img
        className="r-bg"
        src={staticFile("snow-night/assets/background-source.png")}
        style={{ transform: `scale(${push})` }}
      />
      <Img className="r-road" src={staticFile("snow-night/assets/road-texture.png")} />
      <div className="r-grade" style={{ opacity: 0.76 + roadPulse * 0.16 }} />
      <div className="r-reflection" style={{ opacity: 0.2 + roadPulse * 0.24 }} />
      <div className="r-lamp" style={{ opacity: Math.max(0.2, lamp) }} />
      <div className="r-fog" style={{ transform: `translateX(${Math.sin(frame / 55) * 40}px)` }} />
      <Img
        className="r-ghost r-ghost-a"
        src={staticFile("snow-night/assets/ghosts.png")}
        style={{ opacity: ghostOpacity(frame, 70, 165), transform: `translateX(${Math.sin(frame / 18) * 10}px) scale(.38)` }}
      />
      <Img
        className="r-ghost r-ghost-b"
        src={staticFile("snow-night/assets/ghosts.png")}
        style={{ opacity: ghostOpacity(frame, 172, 268), transform: `translateX(${Math.cos(frame / 20) * 12}px) scale(.44)` }}
      />
      <div className="r-snow">
        {flakes.map((flake, index) => {
          const y = (flake.top + (frame * flake.speed) / 30) % 140;
          const x = flake.left + (frame * flake.drift) / 900;
          return (
            <span
              key={index}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: flake.size,
                height: flake.size,
                opacity: flake.opacity,
                filter: `blur(${flake.blur}px)`,
              }}
            />
          );
        })}
      </div>
      <div className="r-vignette" />
      <div className="r-title">
        <p>深夜怪谈电台</p>
        <h1>雪路尽头的回声</h1>
        <span>EP.07 / 一条无人归来的老街</span>
      </div>
    </AbsoluteFill>
  );
};
