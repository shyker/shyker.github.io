"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
//123
interface WhoAmIProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  image?: string;
  isTransparent?: boolean;
  className?: string;
  pageId?: string;
}

export const WhoAmI = ({
  x = 60,
  y = 500,
  width = 300,
  height = 300,
  image = "/image/whoami/whoami1.png",
  isTransparent = true,
  className,
  pageId = "home", 
}: WhoAmIProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTrigger = async (manualTrigger?: string, overrideId?: string) => {
    if (showDialog) return;

    const currentAction = manualTrigger || `click`;
    const currentPage = overrideId || pageId;

    try {
      // 这里的 apiUrl 会自动读取你 .env.production 里的 Cloudflare 隧道地址
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:8000`;
      
      const response = await fetch(`${apiUrl}/api/get-dialogue`, {        
        method: `POST`,
        headers: { 
          "Content-Type": "application/json",
          // ✨ 核心修复：绕过 Cloudflare 的浏览器警告页面
          "cf-no-browser-warning": "true" 
        },
        body: JSON.stringify({ 
          trigger_type: currentAction, 
          page_id: currentPage 
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const selectedText = data.message;
      const duration = 2000 + selectedText.length * 200;

      setCurrentText(selectedText);
      setShowDialog(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowDialog(false);
      }, duration);
    } catch (err) {
      console.error("Character Dialogue Error: 无法连接至后端。", err);
      // 容错处理：连接失败时显示默认文字，防止小人完全变哑巴
      setCurrentText("...... (连接超时)");
      setShowDialog(true);
      timerRef.current = setTimeout(() => setShowDialog(false), 2000);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    const initTimeout = setTimeout(() => {
      handleTrigger(`entry`); 
    }, 1500);

    const handleGlobalTrigger = (e: any) => {
      const { type, id } = e.detail;
      handleTrigger(type, id);
    };

    window.addEventListener("character-speak", handleGlobalTrigger);

    return () => {
      clearTimeout(initTimeout);
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("character-speak", handleGlobalTrigger);
    };
  }, [pageId, mounted]);

  if (!mounted) return null;

  return (
    <div
      className={cn(`${"fixed z-[9999] select-none"}`, className)}
      style={{ top: y, right: x, width: width, height: height, pointerEvents: `none` }}
    >
      <style jsx global>{`
        @keyframes smoke-clump {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-120px) translateX(-40px) scale(3) rotate(20deg); opacity: 0; }
        }
        @keyframes smoke-wisp {
          0% { transform: translateY(0) scaleY(1) skewX(0deg); opacity: 0; }
          30% { opacity: 0.4; }
          100% { transform: translateY(-180px) scaleY(2) skewX(20deg) translateX(-60px); opacity: 0; }
        }
        .smoke-clump {
          animation: smoke-clump 6s ease-out infinite;
          background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%);
          filter: blur(6px);
        }
        .smoke-wisp {
          animation: smoke-wisp 8s ease-in-out infinite;
          background: linear-gradient(to top, rgba(255,255,255,0.2), rgba(255,255,255,0));
          filter: blur(3px); width: 2px; border-radius: 100%;
        }
      `}</style>

      {/* 点击热区 */}
      <div 
        onClick={() => handleTrigger(`click`)}
        className={cn(`${"absolute pointer-events-auto z-[10001]"}`, showDialog ? `${"cursor-default"}` : `${"cursor-pointer"}`)}
        style={{ top: '5%', right: '20%', width: '35%', height: '30%', borderRadius: '40% 40% 0 0' }}
      />
      <div 
        onClick={() => handleTrigger(`click`)}
        className={cn(`${"absolute pointer-events-auto z-[10001]"}`, showDialog ? `${"cursor-default"}` : `${"cursor-pointer"}`)}
        style={{ top: '35%', right: '10%', width: '55%', height: '60%' }}
      />

      {/* 对话框本体 */}
      <AnimatePresence mode={`${"wait"}`}>
        {showDialog && (
          <motion.div
            key={currentText}
            initial={{ opacity: 0, x: 20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 10, scale: 0.95, filter: "blur(5px)" }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className={`${"absolute top-[25%] right-[80%] z-[10000] bg-white/10 backdrop-blur-md border border-white/30 px-5 py-3 rounded-2xl text-white text-sm tracking-widest w-fit min-w-[160px] max-w-[380px] whitespace-normal break-all leading-relaxed shadow-2xl pointer-events-none"}`}
          >
            {currentText}
            <div className={`${"absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white/10 border-t border-r border-white/30 rotate-45 backdrop-blur-md"}`} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(`${"relative w-full h-full z-10"}`, !isTransparent && `${"bg-white/5 border border-white/10 shadow-2xl rounded-xl"}`)}>
        <img src={image} alt={`Character`} className={`${"w-full h-full object-contain"}`} draggable={false} />
        
        {/* 烟雾特效层 */}
        <div className={`${"absolute top-[28%] right-[75%] w-1 h-1"}`}>
          <div className={`${"smoke-wisp absolute bottom-0 h-16"}`} style={{ animationDelay: '0s', left: '-2px' }} />
          <div className={`${"smoke-wisp absolute bottom-0 h-24"}`} style={{ animationDelay: '3.5s', left: '2px' }} />
          <div className={`${"smoke-clump absolute bottom-0 w-4 h-4 rounded-full"}`} style={{ animationDelay: '1s' }} />
          <div className={`${"smoke-clump absolute bottom-0 w-6 h-6 rounded-full"}`} style={{ animationDelay: '4.5s' }} />
          <div className={`${"smoke-clump absolute bottom-0 w-3 h-3 rounded-full"}`} style={{ animationDelay: '2.2s' }} />
        </div>
      </div>
    </div>
  );
};