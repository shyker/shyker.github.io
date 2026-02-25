"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TVProps {
  x?: number; y?: number; width?: number; height?: number;
  xscreen?: number | string; yscreen?: number | string;
  wscreen?: number | string; hscreen?: number | string;
  currentImage?: string; 
  tvFrameImg?: string;  
  href?: string;        
  className?: string;
}


export const TV = ({
  x = 380, y = 100, width = 800, height = 600,
  xscreen = "14%", yscreen = "15%", wscreen = "72%", hscreen = "58%",
  currentImage, 
  tvFrameImg = "/image/record/TV5.png", 
  href,
  className,
}: TVProps) => {
  const [noiseIndex, setNoiseIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const noiseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let count = 0;
    const interval = setInterval(() => {
      setNoiseIndex((count % 4) + 1); 
      count++;
    }, 50);

    noiseTimerRef.current = setTimeout(() => {
      clearInterval(interval);
      setNoiseIndex(null);
    }, 400);

    return () => {
      clearInterval(interval);
      if (noiseTimerRef.current) clearTimeout(noiseTimerRef.current);
    };
  }, [currentImage, mounted]);

  const handleJump = () => {
    if (href && href !== "#") {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={cn(`${"fixed z-[100] select-none pointer-events-none"}`, className)}
      style={{ left: x, top: y, width, height }}
    >
      <style jsx global>{`
        /* 动画样式保持不变 */
      `}</style>

      {/* 电视机外壳 */}
      <img
        src={tvFrameImg}
        className={`${"absolute inset-0 w-full h-full object-contain z-50 pointer-events-none"}`}
        draggable={false}
      />

      <div 
        onClick={handleJump}
        className={cn(
          `${"absolute z-10 overflow-hidden bg-black pointer-events-auto"}`,
          href && href !== "#" ? `${"cursor-pointer"}` : `${"cursor-default"}`
        )}
        style={{ top: yscreen, left: xscreen, width: wscreen, height: hscreen, borderRadius: '5px' }}
      >
        <div className={`${"absolute inset-0 z-0"}`}>
          {/* 🔥 修复点 1：雪花屏直接渲染，不使用 AnimatePresence，防止 50ms 频率下的动画堆积 */}
          {noiseIndex !== null ? (
            <img 
              key="noise-layer"
              src={`/image/record/no${noiseIndex}.png`} 
              className={`${"w-full h-full object-cover"}`} 
              alt="noise" 
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`${"w-full h-full object-cover"}`}
                alt="content"
              />
            </AnimatePresence>
          )}
        </div>

        {/* 特效叠加层保持不变 */}
        <div className={`${"absolute inset-0 z-10 tv-static-lines tv-jitter-layer pointer-events-none opacity-70"}`} />
        <div className={`${"absolute inset-0 z-20 pointer-events-none overflow-hidden opacity-30"}`}>
          <div className={`${"w-full h-24 bg-gradient-to-b from-transparent via-white/40 to-transparent tv-scanline-scroller"}`} />
        </div>
        <div className={`${"absolute inset-0 z-30 pointer-events-none tv-flicker-layer bg-white/[0.04] mix-blend-overlay"}`} />
        <div className={`${"absolute inset-0 z-40 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.95)]"}`} />
        <div className={`${"absolute inset-0 z-[41] pointer-events-none opacity-[0.12] bg-[linear-gradient(90deg,rgba(0,0,255,0.1),rgba(0,255,255,0.05),rgba(0,0,136,0.1))]"}`} />
      </div>
    </div>
  );
};