import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { assets } from "./assets";
import { createSnowNightScene } from "./threeSnowScene";

const ghostPositions = [
  { className: "ghost ghost-a", delay: 3.8 },
  { className: "ghost ghost-b", delay: 7.5 },
  { className: "ghost ghost-c", delay: 13.5 },
];

export const SnowNightShowcase = () => {
  const threeLayerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const lampRef = useRef<HTMLDivElement>(null);
  const ghostsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!threeLayerRef.current) return undefined;
    const scene = createSnowNightScene(threeLayerRef.current);
    return () => scene.destroy();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const context = gsap.context(() => {
      gsap.to(stage, {
        "--push": 1.045,
        duration: 26,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      ghostsRef.current.forEach((ghost, index) => {
        if (!ghost) return;
        const offset = ghostPositions[index].delay;
        const timeline = gsap.timeline({ repeat: -1, delay: offset, repeatDelay: 7 + index * 4 });
        timeline
          .to(ghost, { opacity: 0.34, filter: "blur(1.5px)", duration: 4.2, ease: "sine.inOut" })
          .to(ghost, { x: index === 1 ? -8 : 6, duration: 4.8, ease: "sine.inOut" }, "<")
          .to(ghost, { opacity: 0, duration: 4.4, ease: "sine.inOut" }, "+=1.2");
      });

      const flicker = () => {
        if (!lampRef.current) return;
        const delay = gsap.utils.random(0.35, 2.7);
        gsap.delayedCall(delay, () => {
          const dim = gsap.utils.random(0.34, 0.72);
          const snap = gsap.utils.random(0.04, 0.16);
          gsap
            .timeline({ onComplete: flicker })
            .to(lampRef.current, { opacity: dim, duration: snap, ease: "none" })
            .to(lampRef.current, { opacity: gsap.utils.random(0.78, 1), duration: gsap.utils.random(0.08, 0.28), ease: "none" })
            .to(stage, { "--lamp-ripple": gsap.utils.random(0.35, 1), duration: 0.2, yoyo: true, repeat: 1 }, "<");
        });
      };
      flicker();
    }, stage);

    return () => context.revert();
  }, []);

  const requestFullscreen = () => {
    stageRef.current?.requestFullscreen?.();
  };

  return (
    <main className="page">
      <section className="stage" ref={stageRef}>
        <img className="background" src={assets.background} alt="" />
        <img className="road-texture" src={assets.roadTexture} alt="" />
        <div className="cold-grade" />
        <div className="lamp-glow lamp-main" ref={lampRef} />
        <div className="lamp-glow lamp-distant" />
        <div className="wet-reflection" />
        <div className="fog fog-low" />
        {ghostPositions.map((ghost, index) => (
          <div
            key={ghost.className}
            className={ghost.className}
            ref={(node) => {
              ghostsRef.current[index] = node;
            }}
          />
        ))}
        <div className="three-layer" ref={threeLayerRef} />
        <div className="snow-streaks" />
        <div className="vignette" />
        <header className="podcast-title">
          <p>深夜怪谈电台</p>
          <h1>雪路尽头的回声</h1>
          <span>EP.07 / 一条无人归来的老街</span>
        </header>
        <button className="fullscreen" type="button" onClick={requestFullscreen} aria-label="全屏">
          ⛶
        </button>
      </section>
    </main>
  );
};
