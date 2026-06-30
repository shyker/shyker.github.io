"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { WhoAmI } from "@/components/magicui/whoami";
import { PosterModule } from "@/components/magicui/PosterModule";
import Centipede from "@/components/magicui/centipede";

// ✨ 每篇文章对应的 WhoAmI 插图映射表
// key: slug (即 .md 文件名), value: 图片路径 (相对于 public 目录)
const WHOAMI_IMAGE_MAP: Record<string, string> = {
  about: "/image/friends/whoami.png",
  whoami: "/image/friends/whoami.png",
  redis1: "/image/friends/whoami.png",
  redis2: "/image/friends/whoami.png",
  re1: "/image/friends/whoami.png",
  worm: "/image/posts/worm-1-2.png",
  TheCommunistManifesto: "/image/friends/whoami.png",
};

// 获取某篇文章的 whoami 插图，未配置时回退到默认图
function getWhoAmIImage(slug: string): string {
  return WHOAMI_IMAGE_MAP[slug] ?? "/image/friends/whoami.png";
}

// ✨ 每篇文章对应的背景氛围样式
// glowColor: Tailwind 颜色类名（如 "blue-500", "emerald-600"），默认 "orange-500"
interface BlogStyle {
  glowColor?: string;
}
const BLOG_STYLE_MAP: Record<string, BlogStyle> = {
  // 示例：不同文章用不同颜色的光晕
  worm: { glowColor: "none" },
  // CTFplus: { glowColor: "emerald-500" },
  // TheCommunistManifesto: { glowColor: "red-700" },
  // re1: { glowColor: "purple-500" },
  // together: { glowColor: "pink-500" },
};

function getBlogStyle(slug: string): BlogStyle {
  return BLOG_STYLE_MAP[slug] ?? {};
}

interface BlogClientProps {
  slug: string;
  content: string;
  toc: { level: number; text: string; id: string }[];
}

export function BlogClient({ slug, content, toc }: BlogClientProps) {
  // 🚀 正文内容的偏移控制
  const renderPos = { x: "12%", y: "12vh", width: "1100px" };

  // ✨ 根据 slug 读取背景光晕颜色，未配置则默认橘色，设为 "none" 则不渲染光晕
  const style = getBlogStyle(slug);
  const glow = style.glowColor ?? "orange-500";
  const hasGlow = glow !== "none";

  // Tailwind 颜色 → RGB 值映射（用于内联 style，绕过 JIT 的动态类名限制）
  const TAILWIND_RGB: Record<string, string> = {
    "orange-500": "249, 115, 22",
    "red-500":   "239, 68, 68",
    "red-600":   "220, 38, 38",
    "red-700":   "185, 28, 28",
    "amber-500": "245, 158, 11",
    "yellow-500":"234, 179, 8",
    "emerald-500":"16, 185, 129",
    "teal-500":  "20, 184, 166",
    "sky-500":   "14, 165, 233",
    "blue-500":  "59, 130, 246",
    "purple-500":"168, 85, 247",
    "pink-500":  "236, 72, 153",
    "green-500": "34, 197, 94",
  };
  const glowRGB = TAILWIND_RGB[glow] ?? "249, 115, 22";

  return (
    <main className={`relative min-h-screen bg-[#000488] text-white overflow-x-hidden scroll-smooth`}>

      {/* --- 蜈蚣 —— 仅 worm 文章 --- */}
      {slug === "worm" && <Centipede />}

      {/* --- D. 左上角返回按钮 --- */}
      <PosterModule
        x={1400} y={30} 
        width={70} height={40} 
        zIndex={10000}
        image="/image/deco/deco20.png" 
        href="/"
        hazy={false}
        isTransparent={true}
      />

      {/* --- C. 右上角精美目录索引 --- */}
      {toc.length > 0 && (
        <nav 
          className={`fixed z-[100] hidden xl:block pointer-events-auto 
                      rounded-2xl p-6 shadow-2xl transition-all duration-300`}
          style={{ 
            top: "70px", 
            right: "70px", 
            width: "240px",
          }}
        >
          <ul className={`space-y-2 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2`}>
            {toc.map((item, index) => (
              <li 
                key={index} 
                style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
                className={`group`}
              >
                <a 
                  href={`#${item.id}`} 
                  className={`text-[11px] leading-relaxed text-white/40 hover:text-white transition-all duration-200 flex items-start gap-2`}
                >
                  <span className={`mt-1.5 w-0.5 h-0.5 bg-white/10 group-hover:bg-orange-500 rounded-full transition-all shrink-0`} />
                  <span className={`truncate group-hover:italic`}>{item.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* --- A. 正文渲染容器 --- */}
      <div 
        className={`relative z-10`} 
        style={{ 
          paddingLeft: renderPos.x, 
          paddingTop: renderPos.y, 
          width: '100%', 
          maxWidth: renderPos.width 
        }}
      >
        <article className={`prose prose-base prose-invert prose-blue max-w-none pb-40`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 id={String(children).toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, "-")} className={`mt-10 mb-6`}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 id={String(children).toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, "-")} className={`mt-8 mb-4`}>
                  {children}
                </h3>
              ),
              img: ({ src, ...props }) => {
                if (!src || typeof src !== 'string') return null;
                const fileName = src.split('/').pop() || "";
                return (
                  <span className={`block my-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20`}>
                    <img 
                      src={`/posts/${slug}/${fileName}`} 
                      className={`w-full h-auto opacity-95 hover:opacity-100 transition-opacity duration-500`} 
                      {...props} 
                      alt={props.alt || "blog-image"}
                    />
                  </span>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>

      <WhoAmI x={0} y={350} width={500} height={500} image={getWhoAmIImage(slug)} isTransparent={true} pageId={`blog_${slug}`} />
      
      {/* 氛围层 —— 颜色由 BLOG_STYLE_MAP 按 slug 控制，设为 "none" 时完全不渲染 */}
      {hasGlow && (
        <>
          <div className={`fixed top-[40%] right-[-10%] w-[700px] h-[600px] blur-[120px] rounded-full pointer-events-none z-0`} style={{ backgroundColor: `rgba(${glowRGB}, 0.25)` }} />
          <div className={`fixed inset-0 mix-blend-overlay pointer-events-none z-[10]`} style={{ backgroundColor: `rgba(${glowRGB}, 0.05)` }} />
          <div className={`fixed top-[40%] right-[-10%] w-[700px] h-[600px] blur-[120px] rounded-full pointer-events-none z-0`} style={{ backgroundColor: `rgba(${glowRGB}, 0.35)` }} />
          <div className={`fixed inset-0 mix-blend-overlay pointer-events-none z-20`} style={{ backgroundColor: `rgba(${glowRGB}, 0.07)` }} />
        </>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(${glowRGB}, 0.3); }
        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}