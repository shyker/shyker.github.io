"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// 1. 在参数类型里增加 image 选项
interface BrokenRecordProps {
  songs?: string[]; 
  image?: string;   // 新增：唱片图片路径
  className?: string;
}

export default function BrokenRecord({ 
  songs = ["/audio/bgm/default.mp3"], 
  image = "/image/record/record3.png", // 2. 默认值设为原来的 record3
  className 
}: BrokenRecordProps) {
  const [isAssembled, setIsAssembled] = useState(false);
  const shards = Array.from({ length: 12 }, (_, i) => i + 1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(songs[currentTrackIndex]);
    }

    const handleEnded = () => {
      const nextIndex = Math.floor(Math.random() * songs.length);
      setCurrentTrackIndex(nextIndex);
      if (audioRef.current) {
        audioRef.current.src = songs[nextIndex];
        audioRef.current.play();
      }
    };

    audioRef.current?.addEventListener("ended", handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current = null;
      }
    };
  }, [songs, currentTrackIndex]);

  const handleClick = () => {
    const nextState = !isAssembled;
    setIsAssembled(nextState);

    if (audioRef.current) {
      if (nextState) {
        audioRef.current.play().catch((e) => console.log("播放被拦截:", e));
      } else {
        audioRef.current.pause();
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
            // 3. 使用 style 动态注入图片路径
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