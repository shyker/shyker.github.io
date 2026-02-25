"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Marquee } from "./marquee";

interface PosterModuleProps {
  x?: string | number;
  y?: string | number;
  width: string | number;
  height: string | number;
  rotate?: number;
  zIndex?: number;
  image?: string;
  gifImage?: string;
  marqueeImages?: string[];
  randomPool?: string[];
  clickChange?: boolean;
  imageList?: string[];
  title?: string;
  description?: string;
  tag?: string;
  titleColor?: string;
  descriptionColor?: string;
  softEdges?: boolean;
  hazy?: boolean;
  brightnessHover?: boolean;
  flickerHover?: boolean;
  showTextAlways?: boolean;
  isTransparent?: boolean;
  href?: string;
  triggerOn?: "click" | "hover" | "longPress";
  dialogueId?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PosterModule = ({
  x = 0, y = 0, width, height, rotate = 0, zIndex = 10,
  image, gifImage, marqueeImages, randomPool, title, description, tag,
  clickChange = false,
  imageList = [],
  titleColor = "white",
  descriptionColor = "rgba(255, 255, 255, 0.6)",
  softEdges = false,
  hazy = true,
  brightnessHover = true,
  flickerHover = false,
  showTextAlways = false,
  isTransparent = false,
  href,
  dialogueId,
  triggerOn,
  className, children
}: PosterModuleProps) => {

  const router = useRouter();
  const initialImg = (clickChange && imageList.length > 0) ? imageList[0] : (gifImage || image);
  const [currentDisplayImage, setCurrentDisplayImage] = useState(initialImg);
  const [imgIndex, setImgIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [mounted, setMounted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickStartTime = useRef<number>(0);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isShuffling) {
      if (clickChange && imageList.length > 0) {
        setCurrentDisplayImage(imageList[imgIndex]);
      } else {
        setCurrentDisplayImage(gifImage || image);
      }
    }
  }, [gifImage, image, isShuffling, clickChange, imageList, imgIndex]);

  const dispatchDialogue = (type: string) => {
    if (!dialogueId) return;
    window.dispatchEvent(new CustomEvent("character-speak", { 
      detail: { type: type, id: dialogueId } 
    }));
  };

  const startShuffle = () => {
    if (!randomPool || randomPool.length === 0 || isShuffling) return;
    setIsShuffling(true);
    timerRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * randomPool.length);
      setCurrentDisplayImage(randomPool[randomIndex]);
    }, 300);
  };

  const stopShuffle = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    setIsShuffling(false);
    const resetImg = (clickChange && imageList.length > 0) ? imageList[imgIndex] : (gifImage || image);
    setCurrentDisplayImage(resetImg);
  };

  const handleMouseEnter = () => {
    if (triggerOn === "hover" && dialogueId) {
      hoverTimerRef.current = setTimeout(() => {
        dispatchDialogue("hover");
      }, 2000);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    clickStartTime.current = Date.now();
    startShuffle();
    if (triggerOn === "longPress") {
      longPressTimerRef.current = setTimeout(() => {
        dispatchDialogue("longPress");
      }, 1000);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const duration = Date.now() - clickStartTime.current;
    if (duration < 200) {
      if (clickChange && imageList.length > 0) {
        const nextIndex = (imgIndex + 1) % imageList.length;
        setImgIndex(nextIndex);
        setCurrentDisplayImage(imageList[nextIndex]);
      }
      if (triggerOn === "click") dispatchDialogue("click");
      if (href) router.push(href);
    }
    stopShuffle();
  };

  if (!mounted) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes flicker-lamp {
          0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; filter: brightness(1.2) contrast(1.1); }
          20%, 24%, 55% { opacity: 0.3; filter: brightness(0.2) contrast(1.5); }
          21%, 56% { opacity: 0.7; filter: brightness(0.8); }
        }
        .animate-flicker-lamp:hover { animation: flicker-lamp 2s infinite; }
        .hover-brighten:hover { filter: brightness(1.1); transition: filter 0.3s; }
        .gif-hardware-accel {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000;
          will-change: filter, opacity;
        }
      `}</style>

      <div
        onMouseEnter={handleMouseEnter}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={stopShuffle}
        className={cn(
          `fixed group transition-all duration-500 ease-in-out cursor-pointer select-none`,
          flickerHover ? `animate-flicker-lamp` : (brightnessHover && `hover-brighten`), 
          isShuffling && `scale-[0.98] brightness-125 z-[999]`, 
          className
        )}
        style={{
          top: y, right: x, width, height, zIndex,
          transform: `rotate(${rotate}deg)`,
        }}
      >
        <div className={cn(
          `absolute inset-0 overflow-hidden transition-all duration-700 gif-hardware-accel`,
          !isTransparent && `bg-white/5 border border-white/10 shadow-2xl`,
          softEdges ? `rounded-xl` : `rounded-none`, 
          hazy && !isShuffling ? `blur-[0.8px] grayscale-[0.05] group-hover:blur-0 group-hover:grayscale-0` : `` 
        )}>
          
          {marqueeImages && marqueeImages.length > 0 && !isShuffling ? (
            <Marquee vertical pauseOnHover className={`[--duration:40s] [--gap:4px] h-full`}>
              {marqueeImages.map((img, i) => (
                <img key={i} src={img} className={`w-full h-full object-cover opacity-90 transition-opacity`} />
              ))}
            </Marquee>
          ) : (
            <img 
              key={currentDisplayImage}
              src={currentDisplayImage} 
              decoding={`async`}
              className={cn(
                `w-full h-full pointer-events-none object-cover transition-opacity duration-300`,
                isTransparent ? `opacity-100` : `opacity-90 group-hover:opacity-100`
              )} 
            />
          )}

          {!isTransparent && (
            <div className={cn(
                `absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-500`,
                showTextAlways ? `opacity-100` : `opacity-0 group-hover:opacity-100`
            )} />
          )}
        </div>

        {/* 文字内容 */}
        <div className={`absolute inset-0 p-4 flex flex-col justify-end pointer-events-none`}>
          {title && (
            <h3 
              className={cn(
                `font-bold text-xs tracking-widest uppercase transition-all duration-500`,
                showTextAlways ? `opacity-100` : `opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`
              )}
              style={{ color: titleColor }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p 
              className={cn(
                `mt-1 text-[10px] line-clamp-2 transition-all duration-500 delay-75`,
                showTextAlways ? `opacity-100` : `opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`
              )}
              style={{ color: descriptionColor }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </>
  );
};