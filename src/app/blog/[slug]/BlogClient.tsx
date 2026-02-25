"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { WhoAmI } from "@/components/magicui/whoami";
import { PosterModule } from "@/components/magicui/PosterModule";

interface BlogClientProps {
  slug: string;
  content: string;
  toc: { level: number; text: string; id: string }[];
}

export function BlogClient({ slug, content, toc }: BlogClientProps) {
  // 🚀 正文内容的偏移控制
  const renderPos = { x: "12%", y: "12vh", width: "1100px" };

  return (
    <main className={`relative min-h-screen bg-[#000488] text-white overflow-x-hidden scroll-smooth`}>
      
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

      <WhoAmI x={0} y={350} width={500} height={500} image="/image/friends/whoami.png" isTransparent={true} pageId={`blog_${slug}`} />
      
      {/* 氛围层 */}
      <div className={`fixed top-[40%] right-[-10%] w-[700px] h-[600px] bg-orange-500/25 blur-[120px] rounded-full pointer-events-none z-0`} />
      <div className={`fixed inset-0 bg-orange-500/5 mix-blend-overlay pointer-events-none z-[10]`} />
      <div className={`fixed top-[40%] right-[-10%] w-[700px] h-[600px] bg-orange-500/35 blur-[120px] rounded-full pointer-events-none z-0`} />
      <div className={`fixed inset-0 bg-orange-500/7 mix-blend-overlay pointer-events-none z-20`} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(249, 115, 22, 0.3); }
        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}