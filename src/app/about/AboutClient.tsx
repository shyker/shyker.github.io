"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { WhoAmI } from "@/components/magicui/whoami";
import { PosterModule } from "@/components/magicui/PosterModule";
import { motion } from "framer-motion";

interface AboutClientProps {
  metadata: any;
  content: string;
}

export default function AboutClient({ metadata, content }: AboutClientProps) {
  // 🚀 坐标与宽度控制
  const renderPos = { 
    x: "15%", 
    y: "15vh", 
    width: "1000px" 
  };

  return (
    <main className={`fixed inset-0 h-screen w-screen bg-[#000488] text-white overflow-hidden select-none`}>
      
      {/* --- D. 返回按钮 --- */}
      <PosterModule
        x={1400} y={30} width={70} height={40} zIndex={10000}
        image="/image/deco/deco20.png" href="/" hazy={false} isTransparent={true}
      />

      {/* --- A. 正文渲染区域 --- */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10`} 
        style={{ 
          paddingLeft: renderPos.x, 
          paddingTop: renderPos.y, 
          width: '100%', 
          maxWidth: renderPos.width 
        }}
      >
        {/* 1. 标题渲染 */}
        {metadata.title && (
          <h1 className={`text-5xl font-bold text-white mb-10 tracking-tighter italic`}>
            {metadata.title}
          </h1>
        )}

        {/* 2. 正文容器：使用反引号防止 Tailwind 类名过长导致的换行解析错误 */}
        <article className={`prose prose-lg prose-invert prose-blue max-w-none`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 className={`mt-8 mb-4`}>{children}</h2>,
              h3: ({ children }) => <h3 className={`mt-6 mb-2`}>{children}</h3>,
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </motion.div>

      {/* 角色组件 */}
      <WhoAmI 
        x={0} y={350} width={500} height={500} 
        image="/image/friends/whoami.png" isTransparent={true} pageId="about" 
      />

      {/* 氛围层 */}
      <div className={`fixed top-[40%] right-[-10%] w-[700px] h-[600px] bg-orange-500/25 blur-[120px] rounded-full pointer-events-none z-0`} />
      <div className={`fixed inset-0 bg-orange-500/7 mix-blend-overlay pointer-events-none z-20`} />

      {/* 核心样式自定义 */}
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
          width: 100vw !important;
          position: fixed;
        }

        .prose p {
          font-size: 1.15rem !important; 
          line-height: 1.8 !important; 
          margin-top: 1.2em !important;
          margin-bottom: 1.2em !important;
          color: rgba(255, 255, 255, 0.95) !important;
          font-weight: 400;
        }

        .prose strong {
          color: #f97316 !important;
        }
      `}</style>
    </main>
  );
}