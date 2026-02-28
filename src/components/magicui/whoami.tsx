"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WhoAmIProps {
  x?: number; y?: number; width?: number; height?: number;
  image?: string; isTransparent?: boolean; className?: string; pageId?: string;
}

export const WhoAmI = ({
  x = 60, y = 500, width = 300, height = 300,
  image = "/image/whoami/whoami1.png", isTransparent = true, className, pageId = "home", 
}: WhoAmIProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getApiUrl = () => {
    // 生产环境会读取 .env.production 中的变量
    return process.env.NEXT_PUBLIC_API_URL || `https://47.108.128.134:8443`;
  };

  useEffect(() => { setMounted(true); }, []);

  const handleTrigger = async (manualTrigger?: string, overrideId?: string) => {
    if (showDialog) return;

    const currentAction = manualTrigger || `click`;
    const apiUrl = getApiUrl();

    try {
      const response = await fetch(`${apiUrl}/api/get-dialogue`, {        
        method: `POST`,
        headers: { 
          "Content-Type": "application/json",
          "cf-no-browser-warning": "true" 
        },
        body: JSON.stringify({ trigger_type: currentAction, page_id: overrideId || pageId }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setCurrentText(data.message);
      setShowDialog(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      // 根据字数动态调整显示时长，增强体验
      timerRef.current = setTimeout(() => setShowDialog(false), 2000 + data.message.length * 200);

    } catch (err) {
      if (manualTrigger === 'click') {
        setCurrentText("Click Here To Start...");
        setShowDialog(true);
        setTimeout(() => {
          window.location.href = `${apiUrl}/api/trust`; 
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (!mounted) return;
    const initTimeout = setTimeout(() => { handleTrigger(`entry`); }, 2500);
    return () => clearTimeout(initTimeout);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className={cn("fixed z-[9999] select-none", className)} style={{ top: y, right: x, width, height, pointerEvents: 'none' }}>
      {/* 点击热区 */}
      <div 
        onClick={() => handleTrigger('click')} 
        className="absolute pointer-events-auto z-[10001] cursor-pointer" 
        style={{ inset: '0 10% 10% 10%' }} 
      />

      <AnimatePresence mode="wait">
        {showDialog && (
          <motion.div 
            // 修复：添加明确的动画生命周期，解决初次弹出异常
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className={cn(
              "absolute top-[20%] right-[85%] z-[10000]",
              "bg-white/10 backdrop-blur-md border border-white/30 px-5 py-3 rounded-2xl",
              "text-white text-sm shadow-2xl min-w-[140px] max-w-[280px] break-words"
            )}
          >
            {currentText}
            {/* 气泡小三角 */}
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white/10 border-t border-r border-white/30 rotate-45 backdrop-blur-md" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("relative w-full h-full z-10", !isTransparent && "bg-white/5")}>
        <img src={image} alt="Character" className="w-full h-full object-contain" draggable={false} />
      </div>
    </div>
  );
};