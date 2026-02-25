"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// 定义参数类型：接受一个字符串数组作为歌曲列表
interface BrokenRecordProps {
  songs?: string[]; 
  className?: string;
}

export default function BrokenRecord({ 
  songs = ["/audio/bgm/default.mp3"], // 默认歌曲
  className 
}: BrokenRecordProps) {
  const [isAssembled, setIsAssembled] = useState(false);
  const shards = Array.from({ length: 12 }, (_, i) => i + 1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // 初始化音频逻辑
  useEffect(() => {
    // 只有在浏览器端才创建音频对象
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(songs[currentTrackIndex]);
    }

    const handleEnded = () => {
      // 随机下一首
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
  }, [songs, currentTrackIndex]); // 当歌曲列表或索引变化时重新绑定

  const handleClick = () => {
    const nextState = !isAssembled;
    setIsAssembled(nextState);

    if (audioRef.current) {
      if (nextState) {
        // 聚合即播放，支持断点续传
        audioRef.current.play().catch((e) => console.log("播放被拦截:", e));
      } else {
        // 破碎即暂停
        audioRef.current.pause();
      }
    }
  };

  return (
    <div 
      className={cn(`${"flex items-center justify-center cursor-pointer py-20"}`, className)} 
      onClick={handleClick}
    >
      <div className={cn(
        `${"relative w-70 h-64 transition-transform duration-1000 ease-in-out transform-gpu"}`,
        `${"animate-spin-slow"}`, 
        isAssembled ? `${"scale-100 running"}` : `${"scale-90 paused"}` 
      )}>
        {shards.map((id) => (
          <div
            key={id}
            className={cn(
              `${"shard absolute inset-0 bg-cover bg-center transition-all duration-700"}`,
              `${"cubic-bezier(0.34, 1.56, 0.64, 1)"}`,
              `${"bg-[url('/image/record/record3.png')]"}`, 
              `${`shard-${id}`}`,
              !isAssembled && `${`broken-shard-${id}`}`
            )}
            style={{ pointerEvents: 'none' }}
          />
        ))}
      </div>
    </div>
  );
}