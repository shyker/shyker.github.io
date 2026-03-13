"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PolaroidFrameProps {
  images: string[];          // 图片链接列表
  titles?: string[];         // 对应图片的标题列表（需与图片数量一致）
  width?: number;            // 整体宽度
  height?: number;           // 整体高度
  x?: number;                // 绝对定位 X
  y?: number;                // 绝对定位 Y
  rotate?: number;           // 初始旋转角度
  frameImage?: string;       // 框架纹理图 (可选)
  className?: string;
}

export const PolaroidFrame = ({
  images = [],
  titles = [],
  width = 300,
  height = 380,
  x,
  y,
  rotate = 0,
  frameImage,
  className,
}: PolaroidFrameProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState({ x: 0, y: 0, rotate: 0 });

  // 处理点击切换逻辑
  const handleNext = () => {
    if (images.length <= 1) return;

    // 1. 随机生成图片离场方向（模拟照片被甩出去的质感）
    const randomX = (Math.random() - 0.5) * 400; 
    const randomY = (Math.random() - 0.5) * 400;
    const randomRotate = (Math.random() - 0.5) * 90;

    setExitDirection({ x: randomX, y: randomY, rotate: randomRotate });
    
    // 2. 更新索引
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const isAbsolute = x !== undefined || y !== undefined;
  
  // 获取当前标题，若数组不存在则显示空
  const currentTitle = titles[currentIndex] || "";

  return (
    <div
      className={cn(
        "select-none overflow-visible group",
        isAbsolute ? "fixed" : "relative",
        className
      )}
      style={{
        width,
        height,
        left: x,
        top: y,
        transform: `rotate(${rotate}deg)`,
        zIndex: 50,
      }}
    >
      {/* 拍立得白框主体 */}
      <div
        className="relative w-full h-full p-4 pb-16 bg-white shadow-xl flex flex-col items-center"
        style={{
          backgroundImage: frameImage ? `url(${frameImage})` : "none",
          backgroundSize: "cover",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3), 0 0 5px rgba(0,0,0,0.1)",
        }}
      >
        {/* --- 图片层 --- */}
        <div className="relative w-full h-full bg-zinc-100 overflow-hidden border border-black/5 rounded-sm">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={`img-${currentIndex}`}
              src={images[currentIndex]}
              alt="Polaroid content"
              onClick={handleNext}
              className="w-full h-full object-cover cursor-pointer"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                x: exitDirection.x,
                y: exitDirection.y,
                rotate: exitDirection.rotate,
                opacity: 0,
                scale: 0.8,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            />
          </AnimatePresence>
        </div>

        {/* --- 标题层：独立淡入淡出动画 --- */}
        <div className="absolute bottom-4 left-0 w-full px-4 text-center h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={`title-${currentIndex}`} // 使用索引作为 key 触发动画
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-black font-medium tracking-widest text-lg truncate font-serif italic"
            >
              {currentTitle}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* 装饰性高光/边框层 */}
      <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-sm z-20" />
    </div>
  );
};