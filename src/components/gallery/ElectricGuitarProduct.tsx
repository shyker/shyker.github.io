import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Gauge,
  Layers3,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";
import styles from "./ElectricGuitarProduct.module.css";

const GUITAR_IMAGE = "/image/gallery/electric-guitar-red.png";

const features = [
  {
    icon: <Zap size={22} strokeWidth={1.8} />,
    title: "高输出双线圈拾音器",
    text: "保留黑色金属的锐度，也给独奏留下清晰的泛音边缘。",
  },
  {
    icon: <Gauge size={22} strokeWidth={1.8} />,
    title: "快弧度琴颈",
    text: "薄型握感减少高把位阻力，长句、扫拨和跳弦都更轻。",
  },
  {
    icon: <Layers3 size={22} strokeWidth={1.8} />,
    title: "异形琴体平衡配重",
    text: "舞台视觉足够锋利，站姿演奏仍然稳定贴身。",
  },
];

const toneCards = [
  {
    icon: <Volume2 className={styles.toneIcon} strokeWidth={1.7} />,
    title: "Clean",
    text: "干净声道保持颗粒感，分解和弦不会被高输出拾音器压扁。",
  },
  {
    icon: <SlidersHorizontal className={styles.toneIcon} strokeWidth={1.7} />,
    title: "Drive",
    text: "中频更靠前，推入箱头后有紧致的咬合与明确起音。",
  },
  {
    icon: <Sparkles className={styles.toneIcon} strokeWidth={1.7} />,
    title: "Lead",
    text: "高增益下延音更长，快速句子的轮廓仍然清楚。",
  },
];

const specs = [
  ["24", "品位，覆盖现代金属与融合乐需要的高把位音域"],
  ["25.5", "英寸有效弦长，低音弦更紧，高音弦更有弹性"],
  ["2", "组高输出 Humbucker，三段切换覆盖主奏与节奏"],
  ["3.4kg", "参考重量，异形琴体兼顾舞台姿态与平衡"],
];

export function ElectricGuitarProduct() {
  return (
    <main className={styles.page}>
      <nav className={styles.globalNav} aria-label="Gallery navigation">
        <div className={styles.globalNavInner}>
          <Link className={styles.brandLink} href="/gallery">
            Gallery
          </Link>
          <div className={styles.navLinks} aria-hidden="true">
            <span>Design</span>
            <span>Sound</span>
            <span>Specs</span>
          </div>
          <Search className={styles.navIcon} aria-hidden="true" />
        </div>
      </nav>

      <nav className={styles.subNav} aria-label="Product navigation">
        <div className={styles.subNavInner}>
          <span className={styles.productName}>Astra X1</span>
          <div className={styles.subActions}>
            <a className={styles.subLink} href="#sound">
              音色
            </a>
            <a className={styles.subLink} href="#specs">
              参数
            </a>
            <a className={styles.buyButton} href="#buy">
              预约试奏
            </a>
          </div>
        </div>
      </nav>

      <section className={styles.hero} aria-labelledby="guitar-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Electric Guitar</p>
          <h1 className={styles.heroTitle} id="guitar-title">
            <span>黑色琴体。</span>
            <span>红色现场。</span>
          </h1>
          <p className={styles.heroLead}>
            为高增益、快速手感和强舞台轮廓设计的异形电吉他。
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#buy">
              预约试奏 <ChevronRight size={18} aria-hidden="true" />
            </a>
            <a className={styles.secondaryButton} href="#sound">
              探索音色 <ChevronRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.heroMedia}>
          <div className={styles.heroStat}>
            <span className={styles.statValue}>24</span>
            <span className={styles.statLabel}>frets for extended lead range</span>
          </div>
          <div className={styles.productImageWrap}>
            <Image
              className={styles.productImage}
              src={GUITAR_IMAGE}
              alt="A black angular electric guitar on a red studio background"
              fill
              priority
              sizes="(max-width: 900px) 92vw, 560px"
            />
          </div>
          <div className={styles.heroStat}>
            <span className={styles.statValue}>HH</span>
            <span className={styles.statLabel}>dual humbucker architecture</span>
          </div>
        </div>
      </section>

      <section className={styles.darkTile} aria-label="Design features">
        <div className={`${styles.sectionInner} ${styles.split}`}>
          <div>
            <h2 className={styles.darkTitle}>像一把切开空气的乐器。</h2>
            <p className={styles.darkLead}>
              琴体线条保留了锋利的视觉张力，但背带位置、重量分布和手臂支点都为长时间演出重新校准。
            </p>
            <div className={styles.heroActions}>
              <a className={styles.darkButton} href="#specs">
                查看参数 <ChevronRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className={styles.featureList}>
            {features.map((feature) => (
              <article className={styles.featureRow} key={feature.title}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureText}>{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.soundTile} id="sound" aria-labelledby="sound-title">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle} id="sound-title">
            从清音到失真，都有边界。
          </h2>
          <p className={styles.sectionLead}>
            Astra X1 的声音不是一团高增益，而是一把可以被听清的高增益。
          </p>
          <div className={styles.toneGrid}>
            {toneCards.map((card) => (
              <article className={styles.toneCard} key={card.title}>
                <div>{card.icon}</div>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.specTile} id="specs" aria-labelledby="spec-title">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle} id="spec-title">
            现代演奏规格。
          </h2>
          <p className={styles.sectionLead}>
            不为收藏柜设计。为排练室、录音棚和舞台灯下的下一首歌设计。
          </p>
          <div className={styles.specGrid}>
            {specs.map(([value, label]) => (
              <div className={styles.specItem} key={value}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalTile} id="buy" aria-labelledby="buy-title">
        <div className={styles.finalInner}>
          <h2 className={styles.finalTitle} id="buy-title">
            拿起它，第一下就该像开场。
          </h2>
          <p className={styles.finalCopy}>
            黑色哑光琴面、红色视觉背景和紧实输出，让这把琴在页面里安静，在音箱前爆发。
          </p>
          <div className={styles.finalImage}>
            <Image
              src={GUITAR_IMAGE}
              alt="Astra X1 black electric guitar product view"
              fill
              sizes="(max-width: 900px) 82vw, 520px"
            />
          </div>
        </div>
      </section>

      <aside className={styles.stickyBar} aria-label="Purchase summary">
        <div className={styles.stickyInner}>
          <div>
            <span className={styles.stickyName}>Astra X1 Electric Guitar</span>
            <span className={styles.stickyMeta}>Matte black / high-output HH / 24 frets</span>
          </div>
          <a className={styles.stickyButton} href="mailto:hello@example.com?subject=Astra%20X1%20试奏预约">
            <ShoppingBag size={18} aria-hidden="true" />
            预约试奏
          </a>
        </div>
      </aside>
    </main>
  );
}
