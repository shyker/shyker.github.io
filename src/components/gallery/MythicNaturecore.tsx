import type { CSSProperties } from "react";
import styles from "./MythicNaturecore.module.css";

const leftLinks = ["WORLDS", "RITUALS", "WHISPERS"];
const rightLinks = ["CHART", "CODEX", "CONNECT"];

const retreatCards = [
  { title: "12 Wind", meta: "Pathways" },
  { title: "Stone Gate", meta: "View Rest" },
  { title: "Old Root", meta: "View Rest" },
];

export function MythicNaturecore() {
  return (
    <main className={`${styles.page} min-h-screen overflow-x-hidden bg-[#0b0b0b]`}>
      <section className={`${styles.canvas} relative mx-auto min-h-screen overflow-hidden`}>
        <div className={styles.forest} aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              className={styles.trunk}
              key={index}
              style={
                {
                  "--x": `${index * 6.5 - 7}%`,
                  "--delay": `${index * -0.35}s`,
                  "--width": `${18 + (index % 5) * 9}px`,
                  "--alpha": `${0.22 + (index % 4) * 0.08}`,
                  "--tilt": `${-8 + (index % 7) * 2.4}deg`,
                } as CSSProperties
              }
            />
          ))}
          <span className={styles.beamOne} />
          <span className={styles.beamTwo} />
          <span className={styles.beamThree} />
        </div>

        <div className={`${styles.browserFrame} absolute left-1/2 top-[8.2vh] z-10 -translate-x-1/2`}>
          <div className={styles.innerForest} aria-hidden="true">
            {Array.from({ length: 13 }).map((_, index) => (
              <span
                className={styles.innerTrunk}
                key={index}
                style={
                  {
                    "--x": `${index * 8 - 4}%`,
                    "--width": `${16 + (index % 4) * 8}px`,
                    "--alpha": `${0.2 + (index % 5) * 0.08}`,
                    "--tilt": `${-5 + (index % 6) * 2}deg`,
                  } as CSSProperties
                }
              />
            ))}
            <span className={styles.arch} />
            <span className={styles.archShadow} />
            <span className={styles.innerBeam} />
          </div>

          <nav className={styles.nav} aria-label="Mythic Naturecore navigation">
            <div className={styles.navGroup}>
              {leftLinks.map((link) => (
                <a href={`#${link.toLowerCase()}`} key={link}>
                  {link}
                </a>
              ))}
            </div>
            <span className={styles.star}>✦</span>
            <div className={styles.navGroup}>
              {rightLinks.map((link) => (
                <a href={`#${link.toLowerCase()}`} key={link}>
                  {link}
                </a>
              ))}
            </div>
          </nav>

          <div className={styles.reverieState}>
            <div className={styles.reverieCopy}>
              <p className={styles.kicker}>FALL</p>
              <h1>
                <span>INTO</span>
                REVERIE
              </h1>
              <p>
                Crafting boundaries digital worlds and hidden botanical forms where
                mystery dissolves.
              </p>
            </div>

            <div className={styles.cardRail}>
              {retreatCards.map((card, index) => (
                <article className={styles.retreatCard} key={card.title}>
                  <span>{card.title}</span>
                  <small>{card.meta}</small>
                  <b>{index === 0 ? "●" : "○"}</b>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.forgeState}>
            <h2>FORGE BEYOND THE REAL</h2>
            <p>
              Singular voyages to astonishing destinations, shaped for those who
              seek beauty beyond the ordinary and the known.
            </p>
          </div>

          <div className={styles.scrollIndicator} aria-hidden="true">
            <span />
          </div>

          <div className={styles.cursor} aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
