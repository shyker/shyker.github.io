"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WhoAmIProps {
  x?: number; 
  y?: number; 
  width?: number; 
  height?: number;
  image?: string; 
  isTransparent?: boolean; 
  className?: string; 
  pageId?: string;
  // ✨ 新增选项：控制对话框距离组件顶部的距离，实现上下跳转
  dialogTop?: string; 
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
  // ✨ 默认位置设为原本的 20%
  dialogTop = "20%", 
}: WhoAmIProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getApiUrl = () => {
    // 优先读取生产环境变量，确保部署后能连接到 8443 端口
    // return process.env.NEXT_PUBLIC_API_URL || `https://47.108.128.134:8443`;
    return `http://localhost:8000`;
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
        // 根据传入的 ID 匹配 DIALOGUE_DATA 中的对话内容
        body: JSON.stringify({ trigger_type: currentAction, page_id: overrideId || pageId }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setCurrentText(data.message);
      setShowDialog(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      // 根据文字长度动态计算显示时间
      timerRef.current = setTimeout(() => setShowDialog(false), 2000 + data.message.length * 200);

    } catch (err) {
      // 捕获 SSL 证书未信任导致的连接关闭错误
      if (manualTrigger === 'click') {
        setCurrentText("Click Here To Start...");
        setShowDialog(true);
        setTimeout(() => {
          // 跳转至后端信任页以获取授权
          window.location.href = `${apiUrl}/api/trust`; 
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (!mounted) return;

    // 1. 初始进入页面自动尝试触发 entry 对话
    const initTimeout = setTimeout(() => { handleTrigger(`entry`); }, 2500);

    // 2. 监听全局自定义事件，使角色能对其他组件的交互做出响应
    const handleGlobalTrigger = (e: any) => {
      const { type, id } = e.detail; 
      handleTrigger(type, id);
    };

    window.addEventListener("character-speak", handleGlobalTrigger);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener("character-speak", handleGlobalTrigger);
    };
  }, [mounted, pageId]);

  if (!mounted) return null;

  return (
    <div className={cn("fixed z-[9999] select-none", className)} style={{ top: y, right: x, width, height, pointerEvents: 'none' }}>
      {/* 交互热区：覆盖角色主体以拦截点击 */}
      <div 
        onClick={() => handleTrigger('click')} 
        className="absolute pointer-events-auto z-[10001] cursor-pointer" 
        style={{ inset: '0 10% 10% 10%' }} 
      />

      <AnimatePresence mode="wait">
        {showDialog && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            // ✨ 使用 style 来动态控制对话框高度位置
            style={{ top: dialogTop }}
            className={cn(
              "absolute right-[85%] z-[10000]",
              "bg-white/10 backdrop-blur-md border border-white/30 px-5 py-3 rounded-2xl",
              "text-white text-sm shadow-2xl min-w-[140px] max-w-[280px] break-words"
            )}
          >
            {currentText}
            {/* 气泡三角，始终保持在气泡右侧中心 */}
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