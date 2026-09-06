"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./MoonTreeScene.module.css";

const BLUE_IMAGE_SRC = "/image/gallery/moon-tree-blue.png";
const RED_IMAGE_SRC = "/image/gallery/moon-tree-red.png";

export function MoonTreeScene() {
  const [isRed, setIsRed] = useState(false);

  return (
    <section className={styles.shell} aria-label="Moon tree gallery scene">
      <div className={`${styles.scene} ${isRed ? styles.sceneRed : ""}`}>
        <div
          className={`${styles.imageLayer} ${styles.blueLayer}`}
          style={{ backgroundImage: `url(${BLUE_IMAGE_SRC})` }}
        />
        <div
          className={`${styles.imageLayer} ${styles.redLayer}`}
          style={{ backgroundImage: `url(${RED_IMAGE_SRC})` }}
        />
        <div className={styles.skyTint} />
        <div className={styles.vignette} />

        <button
          className={styles.moon}
          type="button"
          aria-pressed={isRed}
          aria-label="Reveal red moonlight"
          onMouseEnter={() => setIsRed(true)}
          onMouseLeave={() => setIsRed(false)}
          onFocus={() => setIsRed(true)}
          onBlur={() => setIsRed(false)}
        >
          <span className={styles.moonCore} />
          <span className={styles.moonGlow} />
        </button>

        <Link className={styles.backLink} href="/gallery">
          Gallery
        </Link>
      </div>
    </section>
  );
}
