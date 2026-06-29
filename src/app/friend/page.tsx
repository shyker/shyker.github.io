"use client"; // 🔥 必须添加这一行
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { FileTextIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Marquee } from "@/components/magicui/marquee"
import { PosterModule } from "@/components/magicui/PosterModule";
import { InteractiveEye } from "@/components/magicui/watcheye";
import { WhoAmI } from "@/components/magicui/whoami";
import { motion, AnimatePresence } from "framer-motion"; // 引入动画库
import React, { useState } from "react";
import { TV } from "@/components/magicui/tv";
export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tvChannel, setTvChannel] = useState("/image/record/blackscreen.jpg");
  const closePreview = () => setPreviewUrl(null);
  const [tvHref, setTvHref] = useState("#");
  
  return (
    <main className="relative min-h-screen bg-[#000488] overflow-x-hidden">
      <div className="fixed absolute top-[40%] right-[-10%] w-[700px] h-[600px] bg-orange-500/35 blur-[120px] rounded-full pointer-events-none" />
      <TV 
        x={150} 
        y={0} 
        width={1200} 
        height={900} 
        xscreen={320}  // 支持像素数值
        yscreen={260}  // 也支持百分比字符串
        wscreen={455} 
        hscreen={345}
        currentImage={tvChannel}
        href={tvHref}
      />
      <PosterModule 
        x={1200} y={200} 
        width={280} height={240} 
        zIndex={1} 
        image="/image/friends/she.jpg" 
        title="𝗔𝗯𝗼𝘂𝘁 her"
        // href="/whosheis"
        description="我超喜欢"
        showTextAlways={true}   // 默认显示文字
        hazy={false}         //关闭朦胧，展示原图
        softEdges={false}
        brightnessHover={true}  // 悬停亮度增加
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        flickerHover={true}  // 开启闪烁效果
        triggerOn="click" dialogueId="yyyyyy"


      />
    <div onClick={() => {
        setTvChannel("/image/friends/3906blog.png");
        setTvHref("https://dx3906lxr.github.io/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1150} y={160} 
        width={140} height={140} 
        rotate={-2}
        image="/image/friends/3906.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="DX3906"
        triggerOn="click" dialogueId="3906"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/hgsblog.png");
        setTvHref("https://www.cnblogs.com/Hanggoash"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1190} y={0} 
        width={140} height={140} 
        rotate={-180}
        zIndex={1}
        image="/image/friends/hgs.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="ɥsɐoƃƃuɐH"
        triggerOn="click" dialogueId="hanggoushi"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/ninebird.png");
        setTvHref("https://www.n1n3bird.top/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={950} y={60} 
        width={160} height={160} 
        rotate={10}
        image="/image/friends/ninebird1.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="N1n3bird" 
        triggerOn="click" dialogueId="nb"

    />
    </div>
    <div onClick={() => {
        setTvChannel("/image/friends/zenus10blog.png");
        setTvHref("https://zenus10.com"); // 假设这是你要跳转的地址
      }}>
        <PosterModule
        x={800} y={20} 
        width={120} height={200} 
        rotate={-7}
        image="/image/whoshewas.jpg" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="Zenus10" 
        triggerOn="click" dialogueId="zenus10"

    />
    </div>

    <div onClick={() => {
        setTvChannel("/image/friends/klareblog.png");
        setTvHref("https://klare.cc/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={900} y={138} 
        width={100} height={100}
        zIndex={100}
        rotate={6}
        image="/image/friends/klare.png" 
        title="klare" 
        titleColor="black"
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        triggerOn="click" dialogueId="klare"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/ctyblog.png");
        setTvHref("https://notion-next-dx9u.vercel.app/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={680} y={60} 
        width={120} height={120} 
        rotate={0}
        image="/image/friends/cty1.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="cty"
        triggerOn="click" dialogueId="cty"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/xzqblog1.png");
        setTvHref("https://github.com/T4nzQ"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1060} y={20} 
        width={160} height={160} 
        rotate={-2}
        gifImage="/image/friends/xzhiqiao.gif" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="xiaozhiqiao"
        triggerOn="click" dialogueId="xiaozhiqiao"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/oakblog.png");
        setTvHref("https://oakbutton.top/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1100} y={350} 
        width={140} height={140} 
        rotate={6}
        image="/image/friends/oakbutton1.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title='oakbutton'
        triggerOn="click" dialogueId="oakbutton"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/fuxiblog.png");
        setTvHref("https://fuxi.host/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1260} y={530} 
        width={200} height={200} 
        rotate={6}
        image="/image/friends/fuxi1.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title='fuxi'
        triggerOn="click" dialogueId="fuxi"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/jerryblog.png");
        setTvHref("https://fallenjerry.cn/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1170} y={630} 
        width={170} height={170} 
        rotate={6}
        image="/image/friends/jerry2.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title='Jerry'
        triggerOn="click" dialogueId="jerry"

    /></div>
    
    <div onClick={() => {
        setTvChannel("/image/friends/zzxblog.png");
        setTvHref("https://cantsp3ak.com/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1380} y={480} 
        width={100} height={100} 
        rotate={-8}
        image="/image/friends/zzx.jpg" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="canspeak"
        triggerOn="click" dialogueId="zzx"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/lqhblog.png");
        setTvHref("https://milloong.github.io/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={550} y={110} 
        width={120} height={120} 
        rotate={0}
        gifImage="/image/friends/lqh2.gif" 
        // hazy={true}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="Loongking"
        titleColor="black"
        triggerOn="click" dialogueId="lqh"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/steam.png");
        setTvHref("https://store.steampowered.com/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1100} y={480} 
        width={250} height={150} 
        rotate={0}
        zIndex={1}
        image="/image/friends/rainworld.jpg"
        marqueeImages={[ 
          "/image/friends/Minecraft.jpg", 
          "/image/friends/Terraria.jpg", 
          "/image/friends/stardew.jpg", 
          "/image/friends/deadcells.jpg", 
          "/image/friends/hearthstone1.jpg", 
          "/image/friends/sts.jpg", 
          "/image/friends/outerwilds.jpg", 
          "/image/friends/rainworld.jpg"
        ]}
        hazy={true}         //关闭朦胧，展示原图
        showTextAlways={true}   // 默认显示文字

        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="My favorite game"
    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/Aununoblog2.png");
        setTvHref("https://aununo.xyz"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1100} y={630} 
        width={150} height={150} 
        rotate={-10}
        image="/image/friends/Aununo1.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="Aununo"
        triggerOn="click" dialogueId="Aununo"

    /></div>
    <div onClick={() => {
        setTvChannel("/image/friends/shenshenblog.png");
        setTvHref("https://shenshenovo.cn/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1000} y={650} 
        width={120} height={120} 
        rotate={10}
        image="/image/friends/xushen2.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="shenshenovo"
        triggerOn="click" dialogueId="shenshen"

    />
    </div>
    <div onClick={() => {
        setTvChannel("/image/friends/whynotblog.png");
        setTvHref("https://reader001-guius.github.io/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1400} y={80} 
        width={150} height={120} 
        rotate={0}
        image="/image/friends/whynot.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="whynot"
        triggerOn="click" dialogueId="whynot"

        // titleColor="blue" // 克莱因蓝
    />
    </div>
    <div onClick={() => {
        setTvChannel("/image/friends/autblog.png");
        setTvHref("https://aut-11.github.io/mysite/splash/"); // 假设这是你要跳转的地址
      }}>
    <PosterModule
        x={1200} y={360} 
        width={150} height={150} 
        rotate={0}
        image="/image/friends/aut.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        title="aut"
        triggerOn="click" dialogueId="aut"

    />
    </div>
    <PosterModule
        x={1450} y={370} 
        width={90} height={100} 
        rotate={0}
        image="/image/deco/deco1.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={1070} y={535} 
        width={90} height={100} 
        rotate={0}
        image="/image/deco/deco2.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={1140} y={600} 
        width={30} height={30} 
        rotate={0}
        image="/image/deco/deco3.png" 
        hazy={false}       
        isTransparent={true}
    />
<PosterModule
        x={1100} y={440} 
        width={40} height={40} 
        rotate={0}
        image="/image/deco/deco3.png" 
        hazy={false}        
        isTransparent={true}
        zIndex={20}
    />
    <PosterModule
        x={1350} y={240} 
        width={100} height={100} 
        rotate={-30}
        image="/image/deco/deco4.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />

<PosterModule
        x={750} y={150} 
        width={100} height={100} 
        rotate={10}
        image="/image/deco/deco5.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />

<PosterModule
        x={950} y={0} 
        width={100} height={100} 
        rotate={10}
        image="/image/deco/deco6.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={870} y={50} 
        width={120} height={120} 
        rotate={10}
        image="/image/deco/deco7.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={1300} y={80} 
        width={160} height={160} 
        rotate={0}
        image="/image/deco/deco8.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    {/* <PosterModule
        x={1200} y={380} 
        width={100} height={100} 
        rotate={30}
        image="/image/deco/deco9.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    /> */}
    <PosterModule
        x={1400} y={200} 
        width={200} height={200} 
        rotate={30}
        image="/image/deco/deco10.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={1050} y={700} 
        width={120} height={120} 
        rotate={0}
        image="/image/deco/deco11.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={1370} y={0} 
        width={120} height={80} 
        rotate={0}
        image="/image/deco/deco13.png" 
        href="/"
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={350} y={730}
        width={80} height={80}
        rotate={0}
        clickChange={true}
        imageList={[
          "/image/deco/deco12.png",
         "/image/deco/deco12-1.png",
         
        ]}
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={660} y={-10} 
        width={90} height={100} 
        rotate={0}
        image="/image/deco/deco14.png" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    />
    <PosterModule
        x={1400} y={630} 
        width={160} height={160} 
        rotate={0}
        gifImage="/image/deco/dimond1.gif" 
        hazy={false}         //关闭朦胧，展示原图
        isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
        // title="xiaozhiqiao"
        // triggerOn="click" dialogueId="xiaozhiqiao"

    />

          <InteractiveEye
            x="89%" 
            y="43%" 
            size={100}
            frameImg="/image/eye/frame.png"  // 只有睫毛和眼眶
            irisImg="/image/eye/iris.png"    // 只有中间那个圆圆的眼珠
            blinkImg="/image/eye/frame.png"  // 闭合后的眼缝图
            />
    
    
          <InteractiveEye 
            x="92%" 
            y="31%" 
            size={100}
            frameImg="/image/eye/frame.png"  // 只有睫毛和眼眶
            irisImg="/image/eye/iris.png"    // 只有中间那个圆圆的眼珠
            blinkImg="/image/eye/frame.png"  // 闭合后的眼缝图
            />
          {/* 海报 A：右上角的主视觉 */}
         {/* --- 海报 A 系列 --- */}
    
          {/* A-1: 右上角主视觉 - 开启羽化 + 悬停增亮 */}
          {/* --- 海报 A 系列 --- */}
    
          {/* A-1: 主视觉海报 - 锐利、默认朦胧、悬停增亮 */}
          <div onClick={() => {
            setTvChannel("/image/friends/whoami.png");
            setTvHref("/"); // 假设这是你要跳转的地址
          }}>
          <PosterModule 
            x={60} y={200} 
            width={280} height={240} 
            zIndex={1} 
            image="/image/shyler11.jpg" 
            title="𝗔𝗯𝗼𝘂𝘁 𝗠𝗲"
            // href="/blog/whoami"
            description="..............Hi there"
            showTextAlways={true}   // 默认显示文字
            hazy={false}         //关闭朦胧，展示原图
            softEdges={false}
            brightnessHover={true}  // 悬停亮度增加
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
            flickerHover={true}  // 开启闪烁效果
    
          /></div>
    
          {/* A-2: 纵向走马灯海报 - 紧凑循环、旋转感 */}
          <PosterModule 
            x={160} y={20} 
            width={140} height={200} 
            rotate={3}
            zIndex={3}
            href="/friend"
    
            marqueeImages={[ 
              "/image/person3.jpg", 
              "/image/person1.jpg", 
              "/image/person2.jpg",
              "/image/person6.jpg",
              "/image/person7.jpg",
              "/image/person8.jpg",
              "/image/person9.jpg",
              "/image/person12.jpg",
            ]}
            title="Friends"
            description="𝓷𝓲𝓬𝓮 𝓽𝓸 𝓶𝓮𝓮𝓽 𝓾"
            softEdges={false}       // 锐利直角
            hazy={false}             // 默认朦胧
            showTextAlways={true}   // 默认显示文字
            // isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    
    
          />
    
          {/* --- 海报 B 系列 --- */}
    
          {/* B-1: 小型方块海报 - 极简展示 */}
          <PosterModule 
            x={50} y={80} 
            width={150} height={200} 
    
            image="/image/mouth/mout2.png" 
            isTransparent={true} // 保持纯净
            randomPool={["/image/mouth/mout2.png", "/image/mouth/mout1.png"]}
            hazy={false}
            triggerOn="hover"
            dialogueId="mouth"
          />
    
          {/* B-2: 横向窄条海报 */}
          <PosterModule 
            x={300} y={50} 
            width={150} height={70} 
            rotate={-2}
            zIndex={5} 
            image="/image/shyler3.jpg"
            title="𝖡𝗎𝗂𝗅𝖽𝗂𝗇𝗀..."
            softEdges={false}
            hazy={true}
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    
          />
    
          {/* B-3: 宾果格风格海报 - 丰富文字、高交互感 */}
          <PosterModule 
            x={350} y={300} 
            width={100} height={100} 
            rotate={-2}
            zIndex={5} 
            image="/image/shyler4.jpg" 
            title="𝐓𝐨𝐨𝐥𝐬" 
            description="something interesting"
            // tag="Bento Style"
            softEdges={false}       // 锐利直角，去除圆角感
            hazy={true}             // 默认模糊
            brightnessHover={true}  // 悬停增亮，突出文字
            isTransparent={true}   // 🔥 开启特殊处理：无边框、无阴影、无渐变
    
          />
          
  
      <WhoAmI 
        x={0}
        y={350} 
        width={500} 
        height={500} 
        image="/image/friends/whoami.png"
        isTransparent={true}
        pageId="friends"
      />
      <div className="inset-0 bg-orange-500/7 mix-blend-overlay" />
    </main>
  );
}