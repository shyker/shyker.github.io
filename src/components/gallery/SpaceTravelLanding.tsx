"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import styles from "./SpaceTravelLanding.module.css";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4";

const CAPABILITIES_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4";

const navLinks = ["Home", "Voyages", "Worlds", "Innovation", "Plan Launch"];
const partners = ["Aeon", "Vela", "Apex", "Orbit", "Zeno"];

const fadeIn = {
  hidden: { filter: "blur(10px)", opacity: 0, y: 20 },
  visible: { filter: "blur(0px)", opacity: 1, y: 0 },
};

function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.25 2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.1 2.25 3.15 5.08 3.15 8.5S14.1 18.25 12 20.5C9.9 18.25 8.85 15.42 8.85 12S9.9 5.75 12 3.5Z" />
    </svg>
  );
}

const materialIcons = {
  image:
    "M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z",
  movie:
    "M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z",
  bulb:
    "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z",
};

const capabilityCards = [
  {
    title: "AI Scenery",
    icon: materialIcons.image,
    tags: ["Natural Context", "Photo Realism", "Infinite Settings", "Eco-Vibe"],
    text: "AI analyzes your product to create indistinguishable natural environments - from Icelandic cliffs to misty forests.",
  },
  {
    title: "Batch Production",
    icon: materialIcons.movie,
    tags: ["Scale Fast", "Visual Consistency", "Time Saver", "Ready to Post"],
    text: "Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.",
  },
  {
    title: "Smart Lighting",
    icon: materialIcons.bulb,
    tags: ["Ray Tracing", "Physical Shadows", "Studio Quality", "Sunlight Sync"],
    text: "Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.",
  },
];

function FadingVideo({
  src,
  className,
  style,
}: {
  src: string;
  className: string;
  style?: CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const FADE_MS = 500;
    const FADE_OUT_LEAD = 0.55;

    const fadeTo = (target: number, duration = FADE_MS) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      const start = performance.now();
      const from = Number.parseFloat(video.style.opacity || "0");

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        video.style.opacity = String(from + (target - from) * progress);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const onLoadedData = () => {
      video.style.opacity = "0";
      void video.play();
      fadeTo(1);
    };

    const onTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;
      if (!fadingOutRef.current && remaining <= FADE_OUT_LEAD && remaining > 0) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    };

    const onEnded = () => {
      video.style.opacity = "0";
      window.setTimeout(() => {
        video.currentTime = 0;
        fadingOutRef.current = false;
        void video.play();
        fadeTo(1);
      }, 100);
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    if (video.readyState >= 2) {
      onLoadedData();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      playsInline
      preload="auto"
      style={{ opacity: 0, ...style }}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function BlurText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const inView = useInView(ref, { amount: 0.1, once: true });

  return (
    <p
      ref={ref}
      aria-label={text}
      className="flex max-w-2xl flex-wrap justify-center gap-y-[0.1em] text-6xl leading-[0.8] font-heading tracking-[-4px] text-white italic md:text-7xl lg:text-[5.5rem]"
    >
      {text.split(" ").map((word, index) => (
        <motion.span
          aria-hidden="true"
          className="inline-block"
          key={`${word}-${index}`}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={
            inView
              ? {
                  filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                  opacity: [0, 0.5, 1],
                  y: [50, -5, 0],
                }
              : undefined
          }
          transition={{
            delay: index * 0.1,
            duration: 0.7,
            ease: "easeOut",
            times: [0, 0.5, 1],
          }}
          style={{ marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

export function SpaceTravelLanding() {
  const [suppressMotionWarning] = useState(true);

  useEffect(() => {
    if (!suppressMotionWarning) {
      return;
    }

    const originalError = console.error;
    console.error = (...args) => {
      if (String(args[0]).includes("Each child in a list should have a unique")) {
        return;
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, [suppressMotionWarning]);

  return (
    <main className={`${styles.page} bg-black text-white`}>
      <section className="relative flex min-h-screen overflow-hidden bg-black">
        <FadingVideo
          src={HERO_VIDEO}
          className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top"
          style={{ width: "120%", height: "120%" }}
        />

        <div className="relative z-10 flex min-h-screen w-full flex-col">
          <nav className="fixed top-4 left-0 z-50 flex w-full items-center justify-between px-8 lg:px-16">
            <Link
              className={`${styles["liquid-glass"]} flex h-12 w-12 items-center justify-center rounded-full font-heading text-4xl leading-none text-white italic`}
              href="/gallery"
              aria-label="Back to gallery"
            >
              a
            </Link>

            <div className={`${styles["liquid-glass"]} hidden items-center rounded-full px-1.5 py-1.5 md:flex`}>
              {navLinks.map((link) => (
                <a
                  className="px-3 py-2 font-body text-sm font-medium whitespace-nowrap text-white/90"
                  href={link === "Home" ? "/gallery/space-travel" : `#${link.toLowerCase().replaceAll(" ", "-")}`}
                  key={link}
                >
                  {link}
                </a>
              ))}
              <a
                className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-body text-sm font-medium whitespace-nowrap text-black"
                href="#claim"
              >
                Claim a Spot
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="h-12 w-12" aria-hidden="true" />
          </nav>

          <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
            <motion.div
              className={`${styles["liquid-glass"]} flex items-center rounded-full p-1`}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4, ease: "easeOut" }}
            >
              <span className="rounded-full bg-white px-3 py-1 font-body text-xs font-semibold text-black">
                New
              </span>
              <span className="pr-3 pl-2 font-body text-sm text-white/90">
                Maiden Crewed Voyage to Mars Arrives 2026
              </span>
            </motion.div>

            <div className="mt-5">
              <BlurText text="Venture Past Our Sky Across the Universe" />
            </div>

            <motion.p
              className="mt-4 max-w-2xl font-body text-sm leading-tight font-light text-white md:text-base"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.8, ease: "easeOut" }}
            >
              Discover the universe in ways once unimaginable. Our pioneering vessels
              and breakthrough engineering bring deep-space exploration within reach -
              secure and extraordinary.
            </motion.p>

            <motion.div
              className="mt-6 flex items-center gap-6"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.1, ease: "easeOut" }}
            >
              <a
                className={`${styles["liquid-glass-strong"]} flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-medium text-white`}
                href="#start"
              >
                Start Your Voyage
                <ArrowUpRight className="h-5 w-5" />
              </a>
              <a className="flex items-center gap-2 font-body text-sm font-medium text-white" href="#liftoff">
                View Liftoff
                <PlayIcon className="h-4 w-4" />
              </a>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.3, ease: "easeOut" }}
            >
              {[
                { icon: <ClockIcon />, value: "34.5 Min", label: "Average Videos Watch Time" },
                { icon: <GlobeIcon />, value: "2.8B+", label: "Users Across the Globe" },
              ].map((stat) => (
                <article className={`${styles["liquid-glass"]} w-[220px] rounded-[1.25rem] p-5 text-left`} key={stat.value}>
                  <div className="text-white">{stat.icon}</div>
                  <div className="mt-7 font-heading text-4xl leading-none tracking-[-1px] text-white italic">
                    {stat.value}
                  </div>
                  <p className="mt-2 font-body text-xs font-light text-white">{stat.label}</p>
                </article>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col items-center gap-4 px-6 pb-8"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.4, ease: "easeOut" }}
          >
            <div className={`${styles["liquid-glass"]} rounded-full px-3.5 py-1 font-body text-xs font-medium text-white`}>
              Collaborating with top aerospace pioneers globally
            </div>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-2 font-heading text-2xl tracking-tight text-white italic md:gap-x-16 md:text-3xl">
              {partners.map((partner) => (
                <span key={partner}>{partner}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative min-h-screen overflow-hidden bg-black">
        <FadingVideo
          src={CAPABILITIES_VIDEO}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />

        <div className="relative z-10 flex min-h-screen flex-col px-8 pt-24 pb-10 md:px-16 lg:px-20">
          <header className="mb-auto">
            <p className="mb-6 font-body text-sm text-white/80">{"// Capabilities"}</p>
            <h2 className="font-heading text-6xl leading-[0.9] tracking-[-3px] text-white italic md:text-7xl lg:text-[6rem]">
              Production
              <br />
              evolved
            </h2>
          </header>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {capabilityCards.map((card) => (
              <article
                className={`${styles["liquid-glass"]} flex min-h-[360px] flex-col rounded-[1.25rem] p-6`}
                key={card.title}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`${styles["liquid-glass"]} flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem]`}>
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={card.icon} />
                    </svg>
                  </div>

                  <div className="flex max-w-[70%] flex-wrap justify-end gap-1.5">
                    {card.tags.map((tag) => (
                      <span
                        className={`${styles["liquid-glass"]} rounded-full px-3 py-1 font-body text-[11px] whitespace-nowrap text-white/90`}
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-1" />

                <div className="mt-6">
                  <h3 className="font-heading text-3xl leading-none tracking-[-1px] text-white italic md:text-4xl">
                    {card.title}
                  </h3>
                  <p className="mt-3 max-w-[32ch] font-body text-sm leading-snug font-light text-white/90">
                    {card.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
