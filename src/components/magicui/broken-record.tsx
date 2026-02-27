"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// 【全局单例状态】
let globalAudio: HTMLAudioElement | null = null;
let globalSongsStr = "";      
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
  
  // 【辅助函数】：获取一个不与当前索引重复的随机索引
  const getRandomIndex = (excludeIndex: number, length: number) => {
    if (length <= 1) return 0;
    let newIndex = Math.floor(Math.random() * length);
    // 如果随机到了当前正在播的，就再随机一次（简单防重复）
    while (newIndex === excludeIndex) {
      newIndex = Math.floor(Math.random() * length);
    }
    return newIndex;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentSongsStr = JSON.stringify(songs);

    // 1. 初始化或切碟逻辑
    if (!globalAudio || globalSongsStr !== currentSongsStr) {
      if (globalAudio) globalAudio.pause();

      // 【核心修改】：初始化时就随机选一首歌，而不是固定 songs[0]
      const startIndex = Math.floor(Math.random() * songs.length);
      globalTrackIndex = startIndex;
      
      globalAudio = new Audio(songs[startIndex]);
      globalSongsStr = currentSongsStr;
      globalIsPlaying = false; 
    }

    // 同步 UI
    setIsAssembled(globalIsPlaying);

    const handleEnded = () => {
      // 【核心修改】：播放结束时，选取下一个随机索引
      const nextIndex = getRandomIndex(globalTrackIndex, songs.length);
      globalTrackIndex = nextIndex;
      
      if (globalAudio) {
        globalAudio.src = songs[nextIndex];
        // 自动播放下一首
        globalAudio.play().catch(e => console.log("Next track blocked:", e));
      }
    };

    globalAudio.addEventListener("ended", handleEnded);

    return () => {
      globalAudio?.removeEventListener("ended", handleEnded);
    };
  }, [songs]); 

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