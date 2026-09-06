"use client";

import Link from "next/link";
import { PointerEvent, useRef, useState } from "react";
import styles from "./ColosseumScene.module.css";

export function ColosseumScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);

  const updateCursor = (event: PointerEvent<HTMLElement>) => {
    const scene = sceneRef.current;

    if (!scene) return;

    scene.style.setProperty("--cursor-x", `${event.clientX}px`);
    scene.style.setProperty("--cursor-y", `${event.clientY}px`);
  };

  return (
    <main
      ref={sceneRef}
      className={`${styles.scene} ${isActive ? styles.sceneActive : ""}`}
      aria-label="Colosseum gallery scene"
      onPointerEnter={(event) => {
        updateCursor(event);
        setIsActive(true);
      }}
      onPointerMove={updateCursor}
      onPointerLeave={() => setIsActive(false)}
    >
      <div className={styles.revealLayer} aria-hidden="true" />
      <div className={styles.cursorBox} aria-hidden="true" />
      <div className={styles.titleSafeArea} aria-hidden="true" />
      <Link className={styles.backLink} href="/gallery">
        Gallery
      </Link>
    </main>
  );
}
