import Link from "next/link";
import { Button } from "@/components/ui/button";
import styles from "./VelorahHero.module.css";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const navLinks = ["Home", "Studio", "About", "Journal", "Reach Us"];

export function VelorahHero() {
  return (
    <main className={`${styles.page} relative min-h-screen overflow-hidden bg-background text-foreground`}>
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <nav
        className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6"
        aria-label="Velorah navigation"
      >
        <Link
          className="text-3xl tracking-tight text-foreground"
          href="/gallery/velorah"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Velorah<sup className="text-xs">®</sup>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link, index) => (
            <a
              className={`text-sm transition-colors hover:text-foreground ${
                index === 0 ? "text-foreground" : "text-muted-foreground"
              }`}
              href={index === 0 ? "/gallery/velorah" : `#${link.toLowerCase().replaceAll(" ", "-")}`}
              key={link}
            >
              {link}
            </a>
          ))}
        </div>

        <Button
          asChild
          className={`${styles["liquid-glass"]} h-auto rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03]`}
          variant="ghost"
        >
          <a href="#begin">Begin Journey</a>
        </Button>
      </nav>

      <section
        className="relative z-10 flex min-h-[calc(100vh-104px)] flex-col items-center justify-center px-6 pt-32 pb-40 text-center md:py-[90px]"
        aria-labelledby="velorah-title"
      >
        <h1
          className={`${styles["animate-fade-rise"]} max-w-7xl text-5xl leading-[0.95] font-normal tracking-[-2.46px] sm:text-7xl md:text-8xl`}
          id="velorah-title"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
          <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>

        <p
          className={`${styles["animate-fade-rise-delay"]} mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg`}
        >
          We&apos;re designing tools for deep thinkers, bold creators, and quiet rebels.
          Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        <Button
          asChild
          className={`${styles["liquid-glass"]} ${styles["animate-fade-rise-delay-2"]} mt-12 h-auto cursor-pointer rounded-full px-14 py-5 text-base text-foreground transition-transform hover:scale-[1.03]`}
          id="begin"
          variant="ghost"
        >
          <a href="#begin">Begin Journey</a>
        </Button>
      </section>
    </main>
  );
}
