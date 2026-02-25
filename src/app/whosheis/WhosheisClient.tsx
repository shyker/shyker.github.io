"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { WhoAmI } from "@/components/magicui/whoami";
import { PosterModule } from "@/components/magicui/PosterModule";
import { motion } from "framer-motion";

interface WhosheisClientProps {
  content: string;
}

export function WhosheisClient({ content }: WhosheisClientProps) {
  // 🚀 坐标与宽度控制
  const renderPos = { 
    x: "22%", 
    y: "20vh", 
    width: "1200px" 
  };

  return (
    /* 🔥 使用反引号包裹类名，防止解析错误 */
    <main className={`fixed inset-0 h-screen w-screen bg-[#f381f1] text-white overflow-hidden select-none`}>
      
      {/* --- A. 文章渲染主体 --- */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 px-6`} 
        style={{ 
          paddingLeft: renderPos.x, 
          paddingTop: renderPos.y, 
          width: '100%',
          maxWidth: renderPos.width 
        }}
      >
        {/* --- 装饰性海报组 --- */}
        <PosterModule x={50} y={120} width={200} height={200} rotate={30} 
        image="/image/yyyyyy/deco1.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco1"
        />

        <PosterModule x={1340} y={-0} width={200} height={200} rotate={-30} 
        image="/image/yyyyyy/deco2.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco2"
        />

        <PosterModule x={150} y={20} width={200} height={200} rotate={0} 
        image="/image/yyyyyy/deco3.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco3"
        />

        <PosterModule x={450} y={620} width={180} height={180} rotate={0} 
        image="/image/yyyyyy/deco4.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco4"
        />

        <PosterModule x={290} y={640} width={200} height={200} rotate={0} 
        image="/image/yyyyyy/deco5.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco5"
        />

        <PosterModule x={1230} y={490} width={300} height={300} rotate={0} 
        image="/image/yyyyyy/deco6.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco6"
        />

        <PosterModule x={650} y={-30} width={250} height={250} rotate={6} 
        image="/image/yyyyyy/deco7.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco7"
        />

        <PosterModule x={970} y={-0} width={150} height={150} rotate={-6} 
        image="/image/yyyyyy/deco8.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco8"
        />

        <PosterModule x={1130} y={250} width={350} height={350} rotate={-6} 
        image="/image/yyyyyy/deco9.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco9"
        />

        <PosterModule x={350} y={-30} width={250} height={250} rotate={0} 
        image="/image/yyyyyy/deco10.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco10"
        />

        <PosterModule x={1150} y={650} width={180} height={180} rotate={0} 
        image="/image/yyyyyy/deco11.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco11"
        />

        <PosterModule x={1350} y={400} width={200} height={200} rotate={0} 
        image="/image/yyyyyy/deco12.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco12"
        />

        <PosterModule x={0} y={0} width={200} height={200} rotate={0} 
        image="/image/yyyyyy/deco13.png" hazy={false} isTransparent={true} 
        triggerOn="click" dialogueId="6ydeco13"
        />

        <PosterModule x={1200} y={100} width={200} height={200} rotate={-10} 
        image="/image/deco/deco21.png" hazy={false} isTransparent={true} />
        <PosterModule x={1220} y={450} width={150} height={150} rotate={-10} 
        image="/image/deco/deco20-1.png" hazy={false} isTransparent={true} />
        <PosterModule x={10} y={680} width={180} height={180} rotate={10} 
        image="/image/deco/deco24.png" hazy={false} isTransparent={true} />
        <PosterModule x={700} y={150} width={120} height={120} rotate={30} 
        image="/image/deco/deco25.png" hazy={false} isTransparent={true} />
        <PosterModule x={70} y={300} width={120} height={120} rotate={0} 
        image="/image/deco/deco19-1.png" hazy={false} isTransparent={true} />
        <PosterModule x={1050} y={690} width={150} height={150} rotate={30} 
        image="/image/deco/deco10.png" hazy={false} isTransparent={true} />
        <PosterModule x={1400} y={690} width={150} height={150} rotate={0} 
        image="/image/deco/deco18-1.png" hazy={false} isTransparent={true} />
        <PosterModule x={550} y={20} width={150} height={150} rotate={0} 
        image="/image/deco/deco33.png" hazy={false} isTransparent={true} />
        <PosterModule x={850} y={20} width={150} height={150} rotate={0} 
        image="/image/deco/deco32.png" hazy={false} isTransparent={true} />
        <PosterModule x={1250} y={40} width={100} height={100} rotate={0} 
        image="/image/deco/deco30.png" hazy={false} isTransparent={true} />
        <PosterModule x={230} y={300} width={180} height={180} rotate={0} 
        image="/image/deco/deco29.png" hazy={false} isTransparent={true} />

        {/* --- 核心修复：使用反引号包装跨行类名 --- */}
        <article className={`prose prose-invert prose-blue max-w-none 
          prose-headings:italic prose-headings:tracking-tighter
          prose-strong:text-orange-400`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </motion.div>

      {/* 角色组件 */}
      <WhoAmI 
        x={-50} y={350} 
        width={500} height={500} 
        image="/image/weusour/whoami2.png"
        isTransparent={true}
        pageId="whosheis"
      />

      {/* 视觉环境层 */}
      <div className={`fixed top-[40%] right-[-10%] w-[700px] h-[600px] bg-orange-500/35 blur-[120px] rounded-full pointer-events-none z-0`} />
      <div className={`fixed inset-0 bg-orange-500/7 mix-blend-overlay pointer-events-none z-20`} />

      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
          width: 100vw !important;
          position: fixed;
        }

        .prose p {
          font-size: 1.2rem !important; 
          line-height: 1.8 !important; 
          margin-top: 1.0em !important;
          margin-bottom: 1.0em !important;
          color: rgba(255, 255, 255, 0.95) !important;
          font-weight: 400;
        }

        .prose h1, .prose h2 {
          font-size: 2.5rem !important;
          margin-bottom: 1.5rem !important;
        }
      `}</style>
    </main>
  );
}