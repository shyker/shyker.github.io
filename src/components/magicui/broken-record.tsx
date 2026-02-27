"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// 【核心修改】：全局状态管理
let globalAudio: HTMLAudioElement | null = null;
let globalSongsStr = "";      // 记录当前单例正在运行哪一组歌单
let globalTrackIndex = 0;
let globalIsPlaying = false;

interface BrokenRecordProps {
  songs?: string[]; 
  image?: string;   
  className?: string;
}

export default function BrokenRecord({ 
  songs = ["/audio/bgm/default.mp3"], 
  image = "/image/record/record3.png",
  className 
}: BrokenRecordProps) {
  const [isAssembled, setIsAssembled] = useState(false);
  const shards = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 强制同步 UI 状态的方法
  const syncUI = () => {
    setIsAssembled(globalIsPlaying);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. 将传入的歌单转为字符串，用于对比
    const currentSongsStr = JSON.stringify(songs);

    // 2. 初始化或切换歌单逻辑
    if (!globalAudio) {
      // 第一次运行：初始化
      globalAudio = new Audio(songs[0]);
      globalSongsStr = currentSongsStr;
      globalTrackIndex = 0;
    } else if (globalSongsStr !== currentSongsStr) {
      // 【关键修复】：如果页面歌单变了，停止旧的，换成新的
      globalAudio.pause();
      globalAudio.src = songs[0];
      globalSongsStr = currentSongsStr;
      globalTrackIndex = 0;
      globalIsPlaying = false; // 换了碟，默认先别转
    }

    // 同步当前组件的 UI 状态
    syncUI();

    const handleEnded = () => {
      const nextIndex = Math.floor(Math.random() * songs.length);
      globalTrackIndex = nextIndex;
      if (globalAudio) {
        globalAudio.src = songs[nextIndex];
        globalAudio.play();
      }
    };

    globalAudio.addEventListener("ended", handleEnded);

    return () => {
      globalAudio?.removeEventListener("ended", handleEnded);
      // 注意：这里依然不执行 pause()，让它在后台跑
    };
  }, [songs]); // 监听 songs 变化

  const handleClick = () => {
    if (!globalAudio) return;

    const nextState = !isAssembled;
    setIsAssembled(nextState);
    globalIsPlaying = nextState;

    if (nextState) {
      globalAudio.play().catch((e) => console.log("播放被拦截:", e));
    } else {
      globalAudio.pause();
    }
  };

  return (
    <div 
      className={cn("w-full h-full flex items-center justify-center cursor-pointer", className)} 
      onClick={handleClick}
    >
      <div className={cn(
        "relative w-full h-full transition-transform duration-1000 ease-in-out transform-gpu animate-spin-slow",
        isAssembled ? "scale-100 running" : "scale-90 paused" 
      )}>
        {shards.map((id) => (
          <div
            key={id}
            className={cn(
              "shard absolute inset-0 bg-cover bg-center transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)",
              `shard-${id}`,
              !isAssembled && `broken-shard-${id}`
            )}
            style={{ 
              backgroundImage: `url('${image}')`,
              pointerEvents: 'none' 
            }}
          />
        ))}
      </div>
    </div>
  );
}