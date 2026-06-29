"use client";

import { useState } from "react";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { FileTextIcon, Pencil1Icon, ChevronDownIcon } from "@radix-ui/react-icons";
import BrokenRecord from "@/components/magicui/broken-record";
import { PosterModule } from "@/components/magicui/PosterModule";
import { InteractiveEye } from "@/components/magicui/watcheye";
import { WhoAmI } from "@/components/magicui/whoami";

// --- 模拟文章数据库 ---
const ALL_POSTS = [
  {
    name: "钟摆蠕虫",
    description: " ̶T̶i̶c̶k̶ ̶T̶i̶c̶k̶ ̶T̶i̶c̶k̶i̶n̶g̶",
    href: "/blog/worm",
    cta: "read",
    className: `col-span-3 lg:col-span-3 min-h-[100px]`,
    Icon: Pencil1Icon,
    dialogueId: "bento_worm",
    triggerOn: "hover" as const,
    background: (
      <div className={`absolute inset-0`}>
        <img
          src="/image/posts/worm-4-1.png"
          className={`absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-300 group-hover:scale-105`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#000488] via-[#000488]/10 to-transparent`} />
      </div>
    )},

    {
    name: "𝕋𝕙𝕖 ℂ𝕠𝕞𝕞𝕦𝕟𝕚𝕤𝕥 𝕄𝕒𝕟𝕚𝕗𝕖𝕤𝕥𝕠",
    description: "𝕄𝕪 𝔽𝕒𝕚𝕥𝕙",
    href: "/blog/TheCommunistManifesto",
    cta: "read",
    className: `col-span-3 lg:col-span-3 min-h-[100px]`,
    Icon: Pencil1Icon,
    dialogueId: "bento_communist",
    triggerOn: "hover" as const,
    background: (
      <div className={`absolute inset-0`}>
        <img
          src="/image/deco/communist.jpg"
          className={`absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-300 group-hover:scale-105`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#000488] via-[#000488]/10 to-transparent`} />
      </div>
    )
  },
  {
    name: "redis下",
    description: "redis CVE",
    href: "/blog/redis2",
    cta: "read",
    className: `col-span-3 lg:col-span-3 min-h-[100px]`,
    Icon: Pencil1Icon,
    dialogueId: "bento_redis2",
    triggerOn: "hover" as const,
    background: (
      <div className={`absolute inset-0`}>
        <img
          src="/image/pink3.jpg"
          className={`absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-100 group-hover:scale-105`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#000488] via-[#000488]/10 to-transparent`} />
      </div>
    )
  },
  {
    name: "redis上",
    description: "redis服务学习记录",
    href: "/blog/redis1",
    cta: "read",
    className: `col-span-3 lg:col-span-3 min-h-[100px]`,
    dialogueId: "bento_redis",
    triggerOn: "hover" as const,
    Icon: Pencil1Icon,
    background: (
      <div className={`absolute inset-0`}>
        <img
          src="/image/music1.jpg"
          className={`absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-300 group-hover:scale-105`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#000488] via-[#000488]/10 to-transparent`} />
      </div>
    )
  },
  {
    name: "𝓌𝒽𝑜𝒶𝓂𝒾",
    description: "𝓈𝒽𝓎𝓁𝑒𝓇",
    href: "/blog/whoami",
    cta: "read",
    className: `col-span-3 lg:col-span-3 min-h-[50px]`,
    dialogueId: "bento_shyler",
    triggerOn: "hover" as const,
    Icon: FileTextIcon,
    background: (
      <div className={`absolute inset-0`}>
        <img
          src="/image/eye1.jpg"
          className={`absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-300 group-hover:scale-105`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#000488] via-[#000488]/10 to-transparent`} />
      </div>
    ),
  }
];

const ITEMS_PER_PAGE = 4;

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visiblePosts = ALL_POSTS.slice(0, visibleCount);
  const hasMore = visibleCount < ALL_POSTS.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <main className={`relative min-h-screen bg-[#000488] text-white overflow-x-hidden`}>

      {/* --- 视觉装饰组件 --- */}
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

      {/* --- 文章列表区域 --- */}
      <div className={`max-w-4xl mx-20 p-10 pt-24 pb-32 relative z-20`}>
        <h1 className={`text-white text-4xl font-bold mb-12 italic`}>𝓈𝒽𝓎𝓁𝑒𝓇 𝒷𝓁𝑜𝑔</h1>

        <BentoGrid className={`grid-cols-3 gap-8`}>
          {visiblePosts.map((post, idx) => (
            <BentoCard key={idx} {...post} />
          ))}
        </BentoGrid>

        {/* --- 分页控制：Load More 按钮 --- */}
        {hasMore ? (
          <div className={`mt-16 flex justify-center w-full`}>
            <button
              onClick={handleLoadMore}
              className={`group relative px-10 py-4 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-500 rounded-sm uppercase tracking-[0.3em] text-[10px] font-bold flex items-center gap-3 overflow-hidden`}
            >
              {/* 流光动画背景 */}
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]`} />

              <span className={`relative z-10`}>Load More Records</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-500 group-hover:translate-y-1 relative z-10`} />
            </button>
          </div>
        ) : (
          <div className={`mt-20 text-center opacity-20`}>
             <span className={`text-[10px] tracking-[0.6em] uppercase font-light italic`}>
               -- End of Transmission --
             </span>
          </div>
        )}
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