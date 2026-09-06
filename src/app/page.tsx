"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, RefreshCw } from "lucide-react";
import BrokenRecord from "@/components/magicui/broken-record";
import { PosterModule } from "@/components/magicui/PosterModule";
import { InteractiveEye } from "@/components/magicui/watcheye";
import { WhoAmI } from "@/components/magicui/whoami";
import { contentFetch, type ContentCategory } from "@/lib/content";

export default function Home() {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadCategories = useCallback(async () => {
    setLoading(true); setError("");
    try { setCategories(await contentFetch<ContentCategory[]>("/api/public/categories")); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "无法读取文件夹"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadCategories(); }, [loadCategories]);

  return (
    <main className={`relative min-h-screen bg-[#000488] text-white overflow-x-hidden`}>

      {/* --- 视觉装饰组件 --- */}
      <div className="hidden lg:block">
        <InteractiveEye x="89%" y="43%" size={100} frameImg="/image/eye/frame.png" irisImg="/image/eye/iris.png" blinkImg="/image/eye/frame.png" />
        <InteractiveEye x="92%" y="31%" size={100} frameImg="/image/eye/frame.png" irisImg="/image/eye/iris.png" blinkImg="/image/eye/frame.png" />

      {/* --- 唱片 --- */}
      <div className={`fixed top-15 right-73 z-[99999] pointer-events-auto w-70 h-70`}>
        <BrokenRecord songs={[
          "/audio/seeu.m4a",
          "/audio/alex1.m4a",
          "/audio/light.m4a",
        ]} />
      </div>

      {/* --- 海报系列 --- */}
      <PosterModule x={60} y={200} width={280} height={240} zIndex={1} image="/image/shyler11.jpg" title="𝗔𝗯𝗼𝘂𝘁 𝗠𝗲" href="/about" description="..............Hi there" showTextAlways={true} hazy={false} softEdges={false} brightnessHover={true} isTransparent={true} flickerHover={true} />

      <PosterModule x={160} y={20} width={140} height={200} rotate={3} zIndex={3} href="/friend" marqueeImages={["/image/person3.jpg", "/image/person1.jpg", "/image/person2.jpg", "/image/person6.jpg", "/image/person7.jpg", "/image/person8.jpg", "/image/person9.jpg", "/image/person12.jpg"]} title="Friends" description="𝓷𝓲𝓬𝓮 𝓽𝓸 𝓶𝓮𝓮𝓽 𝓾" softEdges={false} hazy={false} showTextAlways={true} />

      <PosterModule x={50} y={80} width={150} height={200} image="/image/mouth/mout2.png" isTransparent={true} randomPool={["/image/mouth/mout2.png", "/image/mouth/mout1.png"]} hazy={false} triggerOn="hover" dialogueId="mouth" />

      <PosterModule x={300} y={50} width={150} height={70} rotate={-2} zIndex={5} image="/image/shyler3.jpg" title="𝖡𝗎𝗂𝗅𝖽𝗂𝗇𝗀..." softEdges={false} hazy={true} isTransparent={true} />

      <PosterModule x={350} y={300} width={100} height={100} rotate={-2} zIndex={5} image="/image/shyler4.jpg" title="𝐓𝐨𝐨𝐥𝐬" description="something interesting" softEdges={false} hazy={true} brightnessHover={true} isTransparent={true} />

      <WhoAmI x={0} y={350} width={500} height={500} image="/image/friends/whoami.png" isTransparent={true} pageId="home" />
      </div>

      {/* --- 文章列表区域 --- */}
      <div className={`max-w-4xl mx-4 sm:mx-10 lg:mx-20 p-4 sm:p-10 pt-20 sm:pt-24 pb-32 relative z-20`}>
        <h1 className={`text-white text-4xl font-bold mb-12 italic`}>𝓈𝒽𝓎𝓁𝑒𝓇 𝒷𝓁𝑜𝑔</h1>
        <p className="-mt-8 mb-10 text-[10px] uppercase tracking-[0.45em] text-white/30">Archive folders · select a record</p>

        {loading && <div className="space-y-9" aria-label="正在读取文件夹">{[0,1,2].map(i => <div key={i} className="h-44 animate-pulse rounded-xl bg-white/5" />)}</div>}
        {error && <div className="rounded-xl border border-red-300/20 bg-red-950/20 p-8 text-sm text-white/60"><p>{error}</p><button onClick={() => void loadCategories()} className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white"><RefreshCw className="h-3.5 w-3.5" />重新读取</button></div>}
        {!loading && !error && <div className="space-y-10">
          {categories.map((folder, index) => (
            <Link key={folder.id} href={`/category?slug=${encodeURIComponent(folder.slug)}`} className="group relative block min-h-44 pt-5 outline-none focus-visible:ring-2 focus-visible:ring-white/70">
              <div className="absolute left-4 top-0 h-10 w-44 rounded-t-xl border border-b-0 border-white/15 bg-[#555399] transition-transform duration-500 group-hover:-translate-y-1" />
              <div className="absolute inset-x-4 bottom-0 top-8 rotate-[0.7deg] rounded-xl bg-[#d8d0b7]/20" />
              <div className="absolute inset-x-2 bottom-1 top-7 -rotate-[0.4deg] rounded-xl border border-white/10 bg-[#292976]" />
              <div className="relative min-h-40 overflow-hidden rounded-xl border border-white/15 bg-[#15156a] shadow-[0_22px_55px_rgba(0,0,30,0.35)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/30 group-hover:shadow-[0_30px_70px_rgba(0,0,30,0.5)]">
                {folder.coverUrl && <img src={folder.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105 group-hover:opacity-50" />}
                <div className="absolute inset-0 bg-gradient-to-r from-[#090957]/95 via-[#101064]/75 to-[#000488]/35" />
                <div className="relative flex min-h-40 items-end justify-between gap-6 p-7 sm:p-9">
                  <div><span className="font-mono text-[9px] uppercase tracking-[0.38em] text-white/35">Folder {String(index + 1).padStart(2, "0")}</span><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{folder.name}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/45">{folder.description || "未命名的档案集合"}</p></div>
                  <div className="flex shrink-0 flex-col items-end gap-3 text-white/45"><FolderOpen className="h-8 w-8 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:text-white/80" /><span className="font-mono text-[10px] tracking-widest">{folder.postCount} FILES</span></div>
                </div>
              </div>
            </Link>
          ))}
        </div>}
      </div>

      {/* --- 氛围环境层 --- */}
      <div className={`fixed top-[40%] right-[-10%] w-[700px] h-[600px] bg-orange-500/35 blur-[120px] rounded-full pointer-events-none z-0`} />
      <div className={`fixed inset-0 bg-orange-500/7 mix-blend-overlay pointer-events-none z-20`} />

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

    </main>
  );
}
