// src/app/together/TogetherClient.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { WhoAmI } from "@/components/magicui/whoami";
import { PosterModule } from "@/components/magicui/PosterModule";
import { motion } from "framer-motion";
import { PolaroidFrame } from "@/components/magicui/PolaroidFrame";
import BrokenRecord from "@/components/magicui/broken-record";


// ✨ 将 Props 接口名称修改为 TogetherClientProps
interface TogetherClientProps {
  content: string;
}

// ✨ 将组件名称修改为 TogetherClient
export function TogetherClient({ content }: TogetherClientProps) {
  // 🚀 坐标与宽度控制 (沿用 whosheis 的配置，你可以根据需要修改)
  const renderPos = { 
    x: "8%", 
    y: "7vh", 
    width: "1000px" 
  };


  return (
    /* 🔥 使用反引号包裹类名，防止解析错误 */
    /* 🔥 修改：将原来的 bg-[#f381f1] 修改为更适合背景图片的深色，比如 bg-zinc-900 */
    <main className={`fixed inset-0 h-screen w-screen bg-zinc-900 text-white overflow-hidden select-none`}>
      
      {/* 🖼️ 新增：背景图片层 */}
      {/* ⚠️ 请在这里替换为你的图片路径 */}
      <img 
        src="/image/weusour/back6.jpg" 
        alt="Together Background"
        className={`absolute inset-0 h-screen w-screen object-cover z-0`}
      />

      {/* --- A. 文章渲染主体 --- */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        // ✨ 修改：为了确保内容能遮挡图片，调整了 padding 配置
        className={`relative z-10 px-6`} 
        style={{ 
          paddingLeft: renderPos.x, 
          paddingTop: renderPos.y, 
          width: '100%',
          maxWidth: renderPos.width 
        }}
      >
        

        {/* --- 核心修复：使用反引号包装跨行类名 --- */}
        <article className={`prose prose-invert prose-blue max-w-none 
          prose-headings:italic prose-headings:tracking-tighter
          prose-strong:text-orange-400`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </motion.div>
      <div className={`fixed top-0 right-10 z-0 pointer-events-auto w-90 h-90`}>
      <BrokenRecord image="/image/weusour/record1.png" songs={[
          "/audio/whereismymind.m4a",
      ]} />      </div>

      <PolaroidFrame 
        images={ [
          "/image/together/unb.jpg",
          "/image/together/cof.jpg",
          "/image/together/nnn.jpg",
          "/image/together/first.jpg",
          "/image/together/pick.jpg",
          "/image/together/swich.jpg",
          "/image/together/nailong.jpg",
          "/image/together/bear.jpg",
          "/image/together/feed1.jpg",
          "/image/together/52.jpg",
          "/image/together/gifts.jpg",
          "/image/together/firsthug.jpg",
          "/image/together/listen1.jpg",

          // "/image/together/pick2.jpg",
          // "/image/weusour/back2.jpg",
          // "/image/weusour/back1.jpg",
        ]}
        titles={[
          "一蓝一粉", 
          "手铐", 
          "男女男",
          "我们第一次牵手",
          "接机路上",
          "换衣服穿(特别的娃娃)",
          "娃，叫Shyyyyyy",
          "脱你衣服",
          "很好吃的厌学小姐的家乡菜",
          "52....0?",
          "时刻都能想起的小桌",
          "第一次拥抱的地方",
          "还要听很久很久",
          // "飞起来咯",
        ]}
        width={320}
        height={400}
        x={1150}      // 距离左边 150px
        y={330}      // 距离顶部 200px
        rotate={8}  // 歪一点更有感觉
        frameImage="/image/weusour/deco4.png" // 如果你有纸张纹理图可以传这个
      />


      <PosterModule
        x={-10} y={10} 
        width={150} height={150} 
        rotate={-70}
        image="/image/weusour/deco6.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        // triggerOn="click" dialogueId="aut"
    />
    <PosterModule
        x={330} y={300} 
        width={150} height={150} 
        rotate={-85}
        image="/image/weusour/6y1.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        triggerOn="click" dialogueId="together6y1"
    />
    <PosterModule
        x={20} y={240} 
        width={120} height={120} 
        rotate={0}
        image="/image/weusour/shyler2.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        triggerOn="click" dialogueId="togethershyler2"
    />
 <PosterModule
        x={300} y={-20} 
        width={150} height={150} 
        rotate={0}
        image="/image/weusour/deco8.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        triggerOn="click" dialogueId="togetherghost"
    />
    <PosterModule
        x={1420} y={680} 
        width={100} height={100} 
        rotate={0}
        image="/image/weusour/deco9.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        triggerOn="click" dialogueId="togetherdenji"
    />
    <PosterModule
        x={1420} y={10} 
        width={120} height={120} 
        rotate={0}
        image="/image/weusour/deco10.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        triggerOn="click" dialogueId="togetherhand"
    /> 
    <PosterModule
        x={1120} y={10} 
        width={80} height={80} 
        rotate={-60}
        image="/image/weusour/deco1.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        // triggerOn="click" dialogueId="aut"
    />
    <PosterModule
        x={1440} y={130} 
        width={80} height={80} 
        rotate={20}
        image="/image/weusour/deco2.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        // triggerOn="click" dialogueId="aut"
    />
     <PosterModule
        x={440} y={80} 
        width={200} height={200} 
        rotate={  0}
        image="/image/weusour/us3.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        triggerOn="click" dialogueId="togetherus3"
    />
    <PosterModule
        x={580} y={180} 
        width={100} height={100} 
        rotate={-20}
        image="/image/weusour/deco16.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="aut"
        triggerOn="click" dialogueId="togetherbab"
    />
    <PosterModule
            x={400} y={180} 
            width={100} height={100} 
            rotate={0}
            gifImage="/image/weusour/gifdeco1.gif" 
            hazy={false}         //关闭朦胧，展示原图
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            // title="xiaozhiqiao"
            // triggerOn="click" dialogueId="xiaozhiqiao"
        />
        <PosterModule
            x={500} y={180} 
            width={100} height={100} 
            rotate={0}
            gifImage="/image/weusour/gifdeco2.gif" 
            hazy={false}         //关闭朦胧，展示原图
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            // title="xiaozhiqiao"
            // triggerOn="click" dialogueId="xiaozhiqiao"
        />
    <PosterModule
            x={1100} y={680} 
            width={100} height={100} 
            rotate={0}
            gifImage="/image/weusour/gifdeco3.gif" 
            hazy={false}         //关闭朦胧，展示原图
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            // title="xiaozhiqiao"
            triggerOn="click" dialogueId="togetherbear"
        />
    <PosterModule
            x={1000} y={680} 
            width={100} height={100} 
            rotate={0}
            gifImage="/image/weusour/gif6y1.gif" 
            hazy={false}         //关闭朦胧，展示原图
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            // title="xiaozhiqiao"
            triggerOn="click" dialogueId="together6ygif"
        />
        <PosterModule
            x={480} y={380} 
            width={150} height={150} 
            rotate={0}
            gifImage="/image/weusour/gifdeco4.gif" 
            hazy={false}         //关闭朦胧，展示原图
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            // title="xiaozhiqiao"
            triggerOn="click" dialogueId="togethergif4"
        />
        <PosterModule
            x={350} y={80} 
            width={100} height={100} 
            rotate={0}
            gifImage="/image/weusour/gifdeco5.gif" 
            hazy={false}         //关闭朦胧，展示原图
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            // title="xiaozhiqiao"
            // triggerOn="click" dialogueId="xiaozhiqiao"
        />
        <PosterModule
            x={450} y={630} 
            width={100} height={100} 
            rotate={180}
            gifImage="/image/weusour/gifdeco6.gif" 
            hazy={false}         //关闭朦胧，展示原图
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            // title="xiaozhiqiao"
            triggerOn="click" dialogueId="togethergif4"
        />
        <PosterModule
            x={430} y={430} 
            width={100} height={100} 
            rotate={0}
            gifImage="/image/weusour/gifdeco7.gif" 
            hazy={false}         //关闭朦胧，展示原图
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            // title="xiaozhiqiao"
            triggerOn="click" dialogueId="togetherusgif"
        />
          <PosterModule
                x={420} y={500}
                width={200} height={150}
                rotate={0}
                clickChange={true}
                imageList={[
                  "/image/weusour/deco12.png",
                  "/image/weusour/deco11.png",
                  "/image/weusour/deco14-1.png",
                  // "/image/weusour/.gif",
                //  "/image/deco/deco12-1.png",
                 
                ]}
                hazy={false}         //关闭朦胧，展示原图
                isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
                triggerOn="click" dialogueId="togetherchat"

            />








      {/* 角色组件 */}
      <WhoAmI 
        x={450} y={280} 
        width={500} height={500} 
        // 可以根据需要修改图片
        dialogTop="45%"
        image="/image/weusour/usus.png"
        isTransparent={true}
        // ✨ 修改：将 pageId 修改为 "together"
        pageId="together"
      />

      {/* 视觉环境层 */}
      {/* ✨ 注意：这些半透明层会叠加在背景图片上 */}
      {/* <div className={`fixed top-[40%] right-[-10%] w-[700px] h-[600px] bg-orange-500/35 blur-[120px] rounded-full pointer-events-none z-0`} /> */}
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