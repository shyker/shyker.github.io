"use client";

import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- 必须导出 BentoGrid 容器 ---
export const BentoGrid = ({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) => {
  return (
    <div
      className={cn(
        `grid w-full auto-rows-[10rem] grid-cols-3 gap-5`,
        className,
      )}
    >
      {children}
    </div>
  );
};

// --- 导出 BentoCard 子项 ---
interface BentoCardProps {
  name: string;
  className: string;
  background: ReactNode;
  Icon?: any;
  description: string;
  href: string;
  cta?: string;
  triggerOn?: "hover" | "click"; 
  dialogueId?: string; 
}

export const BentoCard = ({
  name,
  className,
  background,
  description,
  href,
  triggerOn,
  dialogueId,
}: BentoCardProps) => {
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dispatchDialogue = (type: string) => {
    if (!dialogueId) return;
    window.dispatchEvent(
      new CustomEvent("character-speak", {
        detail: { type: type, id: dialogueId },
      })
    );
  };

  const handleMouseEnter = () => {
    if (triggerOn === "hover") {
      // 持续悬停 2 秒触发角色对话
      hoverTimerRef.current = setTimeout(() => {
        dispatchDialogue("hover");
      }, 2000); 
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleClick = () => {
    if (triggerOn === "click") {
      dispatchDialogue("click");
    }
  };

  return (
    <Link
      href={href || `#`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={cn(
        `group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl`,
        `bg-[#00024d]/80 backdrop-blur-sm transition-all duration-300`,
        className
      )}
    >
      {/* 背景图层 */}
      <div className={`absolute inset-0 z-0 opacity-50 transition-opacity group-hover:opacity-100`}>
        {background}
      </div>

      {/* 文字内容层 */}
      <div className={`pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2`}>
        <h3 className={`text-xl font-semibold text-white`}>{name}</h3>
        <p className={`max-w-lg text-neutral-400 text-sm`}>{description}</p>
      </div>

      {/* 悬停遮罩层 */}
      <div className={`pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/30`} />
    </Link>
  );
};