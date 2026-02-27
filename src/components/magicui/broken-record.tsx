"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// 【核心修改 1】：在组件外部定义全局单例，防止随着组件销毁而重置
let globalAudio: HTMLAudioElement | null = null;
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
  // 根据全局状态初始化 UI
  const [isAssembled, setIsAssembled] = useState(globalIsPlaying);
  const shards = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    // 【核心修改 2】：只在不存在时初始化音频对象
    if (typeof window !== "undefined" && !globalAudio) {
      globalAudio = new Audio(songs[globalTrackIndex]);
    }

    const handleEnded = () => {
      const nextIndex = Math.floor(Math.random() * songs.length);
      globalTrackIndex = nextIndex;
      if (globalAudio) {
        globalAudio.src = songs[nextIndex];
        globalAudio.play();
      }
    };

    globalAudio?.addEventListener("ended", handleEnded);

    // 【核心修改 3】：卸载时不暂停音乐，只移除监听器
    return () => {
      if (globalAudio) {
        globalAudio.removeEventListener("ended", handleEnded);
        // 这里删除了 pause()，音乐会继续在后台运行
      }
    };
  }, [songs]); 

  const handleClick = () => {
    const nextState = !isAssembled;
    setIsAssembled(nextState);
    globalIsPlaying = nextState; // 更新全局播放状态

    if (globalAudio) {
      if (nextState) {
        globalAudio.play().catch((e) => console.log("播放被拦截:", e));
      } else {
        globalAudio.pause();
      }
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