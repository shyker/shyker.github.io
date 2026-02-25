"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InteractiveEyeProps {
  x?: string | number;
  y?: string | number;
  size?: number;
  frameImg: string;
  irisImg: string;
  blinkImg: string;
  zIndex?: number;
  className?: string;
}

export const InteractiveEye = ({
  x = "15%",
  y = "20%",
  size = 200,
  frameImg,
  irisImg,
  blinkImg,
  zIndex = 50,
  className,
}: InteractiveEyeProps) => {
  const [irisPos, setIrisPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const eyeRef = useRef<HTMLDivElement>(null);

  const blinkDuration = 300; // 闭眼持续时间
  const gapDuration = 200;   // 眨眼间隔

  const triggerDoubleBlink = () => {
    if (isBlinking) return;
    setIsBlinking(true);
    setTimeout(() => {
      setIsBlinking(false);
      setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
        }, blinkDuration);
      }, gapDuration);
    }, blinkDuration);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current || isBlinking) return;

      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxDistance = size * 0.075; 
      const limitedDistance = Math.min(distance * 0.1, maxDistance);

      setIrisPos({
        x: Math.cos(angle) * limitedDistance,
        y: Math.sin(angle) * limitedDistance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size, isBlinking]);

  return (
    <div
      ref={eyeRef}
      onClick={triggerDoubleBlink}
      className={cn(`fixed select-none cursor-pointer transform-gpu`, className)}
      style={{ top: y, left: x, width: size, height: size, zIndex }}
    >
      <div className={`relative w-full h-full`}>
        
        {/* --- 睁眼状态层组 --- */}
        <div className={cn(
          `absolute inset-0 transition-opacity duration-300`,
          isBlinking ? `opacity-0` : `opacity-100`
        )}>
          {/* 1. 眼眶层 */}
          <img 
            src={frameImg} 
            alt={`eye frame`}
            className={`absolute inset-0 w-full h-full object-contain`}
          />
          
          {/* 2. 眼珠层 */}
          <div 
            className={`absolute inset-0 flex items-center justify-center pointer-events-none`}
            style={{
              transform: `translate(${irisPos.x}px, ${irisPos.y}px)`,
              transition: `transform 0.1s ease-out`, 
            }}
          >
            <img 
              src={irisImg} 
              alt={`iris`} 
              className={`w-1/2 h-1/2 object-contain`}
              style={{ filter: `drop-shadow(0 0 5px rgba(0,0,0,0.3))` }}
            />
          </div>
        </div>

        {/* --- 闭眼状态层 --- */}
        <div className={cn(
          `absolute inset-0 transition-opacity duration-300`,
          isBlinking ? `opacity-100` : `opacity-0`
        )}>
          <img 
            src={blinkImg} 
            alt={`eye blink`}
            className={`absolute inset-0 w-full h-full object-contain`}
          />
        </div>

      </div>
    </div>
  );
};