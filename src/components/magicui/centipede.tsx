"use client";

import { useEffect, useRef } from "react";

// ── Config ──────────────────────────────────────────────
const SEGMENTS = 32;
const SPACING = 15;
const BODY_RX = 9;  // body half-width
const BODY_RY = 7;  // body half-height
const HEAD_RX = 11;
const HEAD_RY = 8;
const SPEED = 1.3;
const LEG_LEN = 26;
const LEG_PAIRS = 3; // legs per segment (each side)
const TURN_RATE = 0.025;

interface Seg {
  x: number;
  y: number;
  angle: number;
}

export default function Centipede() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;

    let W = window.innerWidth;
    let H = window.innerHeight;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      if (cvs) {
        cvs.width = W;
        cvs.height = H;
      }
    }
    resize();
    window.addEventListener("resize", resize);

    // ── init segments ──────────────────────────────────
    const segs: Seg[] = [];
    const a0 = Math.random() * Math.PI * 2;
    for (let i = 0; i < SEGMENTS; i++) {
      segs.push({
        x: W / 2 - Math.cos(a0) * i * SPACING,
        y: H / 2 - Math.sin(a0) * i * SPACING,
        angle: a0,
      });
    }

    let phase = 0;
    let wand = a0;
    let targetWand = a0;

    // ── helpers ────────────────────────────────────────
    function normAngle(a: number) {
      while (a > Math.PI) a -= Math.PI * 2;
      while (a < -Math.PI) a += Math.PI * 2;
      return a;
    }

    function steerToward(current: number, target: number, rate: number) {
      let d = target - current;
      d = normAngle(d);
      return normAngle(current + d * rate);
    }

    // ── draw ───────────────────────────────────────────
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // draw tail-to-head so head paints on top
      for (let i = SEGMENTS - 1; i >= 0; i--) {
        const s = segs[i];
        const t = i / SEGMENTS; // 0 = head, 1 = tail
        const isHead = i === 0;
        const isTail = i === SEGMENTS - 1;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        const rx = isHead ? HEAD_RX : BODY_RX * (1 - t * 0.2);
        const ry = isHead ? HEAD_RY : BODY_RY * (1 - t * 0.2);

        // ── outer glow ──────────────────────────────────
        ctx.shadowColor = `rgba(255,255,255,0.18)`;
        ctx.shadowBlur = 12;

        // ── body fill ───────────────────────────────────
        const alpha = 0.82 - t * 0.22;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // ── segment border ──────────────────────────────
        ctx.strokeStyle = `rgba(255,255,255,${(0.7 - t * 0.25).toFixed(2)})`;
        ctx.lineWidth = 0.6 + t * 0.1;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // ── inner highlight (top-left crescent) ─────────
        ctx.fillStyle = `rgba(255,255,255,${(0.4 - t * 0.15).toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(-rx * 0.2, -ry * 0.25, rx * 0.35, ry * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();

        // ── legs ────────────────────────────────────────
        const wave = Math.sin(phase * 2.2 + i * 0.6) * 0.4;
        const legAlpha = 0.55 - t * 0.2;
        for (let p = 0; p < LEG_PAIRS; p++) {
          const ox = (p - (LEG_PAIRS - 1) / 2) * rx * 0.75;
          for (let side = -1; side <= 1; side += 2) {
            const base = side * (Math.PI / 2.5 + wave);
            const knee = base + side * 0.5;
            const len = LEG_LEN * (1 - t * 0.5);

            const kx = ox + Math.cos(base) * len * 0.4;
            const ky = Math.sin(base) * len * 0.4;
            const fx = ox + Math.cos(knee) * len;
            const fy = Math.sin(knee) * len;

            // upper leg
            ctx.strokeStyle = `rgba(255,255,255,${legAlpha.toFixed(2)})`;
            ctx.lineWidth = 1.0 - t * 0.35;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(ox, side * ry * 0.2);
            ctx.lineTo(kx, ky);
            ctx.stroke();

            // lower leg
            ctx.lineWidth = 0.7 - t * 0.25;
            ctx.beginPath();
            ctx.moveTo(kx, ky);
            ctx.lineTo(fx, fy);
            ctx.stroke();

            // foot dot (only on outermost pair)
            if (p === 0) {
              ctx.fillStyle = `rgba(255,255,255,${(0.4 - t * 0.15).toFixed(2)})`;
              ctx.beginPath();
              ctx.arc(fx, fy, 1.6 - t * 0.4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // ── head details ────────────────────────────────
        if (isHead) {
          // head is slightly wider at front
          ctx.fillStyle = `rgba(255,255,255,0.88)`;
          ctx.beginPath();
          ctx.ellipse(rx * 0.15, 0, rx * 0.4, ry * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();

          // eyes (two tiny bright dots)
          for (let e = -1; e <= 1; e += 2) {
            ctx.fillStyle = `rgba(255,255,255,0.95)`;
            ctx.shadowColor = `rgba(255,255,255,0.6)`;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(rx * 0.55, e * ry * 0.25, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          // ── antennae ──────────────────────────────────
          for (let a = -1; a <= 1; a += 2) {
            const tipX = rx * 2.8 + Math.sin(phase * 3.5) * 4;
            const tipY = a * ry * 3.2 + Math.cos(phase * 3.2 + a) * 3;

            ctx.strokeStyle = `rgba(255,255,255,0.7)`;
            ctx.lineWidth = 1.2;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(rx * 0.6, a * ry * 0.2);
            ctx.quadraticCurveTo(rx * 2.0, a * ry * 3, tipX, tipY);
            ctx.stroke();

            // glow tip
            ctx.fillStyle = `rgba(255,255,255,0.85)`;
            ctx.shadowColor = `rgba(255,255,255,0.5)`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }
        }

        // ── tail taper ──────────────────────────────────
        if (isTail) {
          // draw a tiny pointed extension
          ctx.strokeStyle = `rgba(255,255,255,0.45)`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-rx * 0.8, 0);
          ctx.lineTo(-rx * 1.4, 0);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // ── loop ───────────────────────────────────────────
    function tick() {
      phase += 0.055;
      const head = segs[0];

      // ── wander ───────────────────────────────────────
      if (Math.random() < 0.007) {
        targetWand += (Math.random() - 0.5) * Math.PI * 0.55;
      }

      // ── boundary logic: soft repel on-screen, center-pull off-screen ─
      if (head.x >= 0 && head.x <= W && head.y >= 0 && head.y <= H) {
        // on-screen — soft repel from the very edge (avoid hugging boundary)
        if (head.x < 25) targetWand = steerToward(targetWand, 0, 0.05);
        else if (head.x > W - 25) targetWand = steerToward(targetWand, Math.PI, 0.05);
        if (head.y < 25) targetWand = steerToward(targetWand, Math.PI / 2, 0.05);
        else if (head.y > H - 25) targetWand = steerToward(targetWand, -Math.PI / 2, 0.05);
      } else {
        // off-screen — steer toward viewport center (stronger = further away)
        const cx = W / 2, cy = H / 2;
        const toCenter = Math.atan2(cy - head.y, cx - head.x);
        const dist = Math.sqrt((head.x - cx) ** 2 + (head.y - cy) ** 2);
        const bias = Math.min(0.04 + dist / 2500, 0.18);
        targetWand = steerToward(targetWand, toCenter, bias);
      }

      // ── smooth turn ──────────────────────────────────
      wand = steerToward(wand, targetWand, TURN_RATE);

      // move head
      head.x += Math.cos(wand) * SPEED * (0.85 + Math.random() * 0.15);
      head.y += Math.sin(wand) * SPEED * (0.85 + Math.random() * 0.15);
      head.angle = wand;

      // ── body follow ──────────────────────────────────
      for (let i = 1; i < SEGMENTS; i++) {
        const prev = segs[i - 1];
        const cur = segs[i];
        const dx = prev.x - cur.x;
        const dy = prev.y - cur.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > SPACING) {
          const r = (dist - SPACING) / dist * 0.48;
          cur.x += dx * r;
          cur.y += dy * r;
        }
        cur.angle = Math.atan2(dy || 0.001, dx || 0.001);
      }

      draw();
      requestAnimationFrame(tick);
    }

    const raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
        opacity: 0.8,
      }}
      aria-hidden
    />
  );
}
