# 构建提示词：电影感太空旅行落地页

构建一个单页落地网站，包含两个全屏高度的区块：Hero 与 Capabilities。两个区块都使用循环背景视频，并通过自定义 JavaScript 交叉淡入淡出效果、统一的液态玻璃设计系统，以及 Framer Motion 入场动画来完成。

## 技术栈（固定版本，仅使用 CDN）

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
<script src="https://unpkg.com/framer-motion@11.11.17/dist/framer-motion.js"></script>
<script>window.Motion = window.FramerMotion;</script>
```

Body 背景色为 `#000`。页面是一个挂载到 `#root` 的 React 应用，所有组件都是 `<script type="text/babel">` 文件，并通过 `window.X = X` 导出。

## 字体

Google Fonts：

```text
family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600
```

Tailwind 配置中添加：

- `font-heading`：`'Instrument Serif', serif`，使用时始终为 italic。
- `font-body`：`'Barlow', sans-serif`。
- 默认圆角覆盖：`DEFAULT: "9999px"`，因此裸 `rounded` 会变成胶囊形。

## 液态玻璃工具类（精确 CSS，放在 `<style>` 块中）

包含两个变体：`.liquid-glass`（较轻，用于导航、标签、卡片）和 `.liquid-glass-strong`（更强的模糊，用于主 CTA）。

```css
.liquid-glass {
background: rgba(255,255,255,0.01);
background-blend-mode: luminosity;
backdrop-filter: blur(4px);
-webkit-backdrop-filter: blur(4px);
border: none;
box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
position: relative;
overflow: hidden;
}
.liquid-glass::before {
content: "";
position: absolute; inset: 0;
border-radius: inherit;
padding: 1.4px;
background: linear-gradient(180deg,
rgba(255,255,255,0.45) 0%,
rgba(255,255,255,0.15) 20%,
rgba(255,255,255,0) 40%,
rgba(255,255,255,0) 60%,
rgba(255,255,255,0.15) 80%,
rgba(255,255,255,0.45) 100%);
-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
-webkit-mask-composite: xor;
mask-composite: exclude;
pointer-events: none;
}
.liquid-glass-strong { /* 相同，但有以下差异： */
backdrop-filter: blur(50px);
box-shadow: 4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15);
}
.liquid-glass-strong::before { /* 相同，但渐变停靠值为 0.5 / 0.2 / 0 / 0 / 0.2 / 0.5 */ }
```

## FadingVideo 组件（自定义 JS 交叉淡入淡出，不使用 CSS transitions）

包裹一个 `<video autoPlay muted playsInline preload="auto">`，初始 `opacity: 0`。

行为：

- `FADE_MS = 500`，`FADE_OUT_LEAD = 0.55` 秒。
- `fadeTo(target, duration)` 使用 `requestAnimationFrame`。
- `fadeTo` 会从 `video.style.opacity` 读取当前透明度，因此新的淡入淡出会从上一次所在的位置继续。
- 每次调用 `fadeTo` 都要先对上一次的 rAF id 调用 `cancelAnimationFrame`，再启动新的 rAF。
- `loadeddata` 时：设置 opacity 为 0，调用 `play()`，然后 `fadeTo(1)`。
- `timeupdate` 时：如果 `fadingOutRef` 尚未设置，并且 `duration - currentTime <= 0.55` 且大于 0，就翻转该 ref，并执行 `fadeTo(0)`。
- `ended` 时：设置 opacity 为 0；`setTimeout(100ms)` 后，将 `currentTime = 0`，调用 `play()`，清空 `fadingOutRef`，并执行 `fadeTo(1)`。
- 不使用 `loop` 属性，因为循环由 `ended` 手动实现。
- 组件卸载时：取消 rAF，并移除事件监听器。

## Section 1：Hero（完整视口高度，黑色背景）

背景视频宽高为 120%，顶部对齐，水平居中。焦点位于画面顶部。

- `src`：`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4`
- `class`：`absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0`
- `style`：`{ width: "120%", height: "120%" }`

不添加遮罩。`z-10` 层包含：Navbar、Hero 内容（`flex-1` 居中）、Partners。

### Navbar（固定在 top-4，px-8 / lg:px-16，z-50）

左侧：48×48 的液态玻璃圆形，内部是 italic serif 小写字母 `a`（Instrument Serif）。

中间（仅桌面显示）：液态玻璃胶囊，`px-1.5 py-1.5`，包含 5 个文本链接：Home、Voyages、Worlds、Innovation、Plan Launch。每个链接：`px-3 py-2 text-sm font-medium text-white/90 font-body`。后面跟一个白色胶囊按钮：`Claim a Spot` 加 ArrowUpRight 图标，`bg-white text-black whitespace-nowrap`。

右侧：48×48 的不可见占位，用于平衡 logo。

### Hero 内容（居中，pt-24 px-4）

全部使用 Framer Motion 动画，初始状态：

```js
{ filter: blur(10px), opacity: 0, y: 20 }
```

缓动为 `easeOut`。

Badge（延迟 0.4s）：液态玻璃圆角胶囊。包含白色胶囊小标签 `New`（`bg-white text-black px-3 py-1 text-xs font-semibold`）以及文本 `Maiden Crewed Voyage to Mars Arrives 2026`（`text-sm text-white/90 pr-3`）。

标题：BlurText 组件逐词动画。文本为：

```text
Venture Past Our Sky Across the Universe
```

样式：`text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-2xl justify-center tracking-[-4px]`。

副标题（延迟 0.8s）：`mt-4 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight`。文本为：

```text
Discover the universe in ways once unimaginable. Our pioneering vessels and breakthrough engineering bring deep-space exploration within reach—secure and extraordinary.
```

CTA 区域（延迟 1.1s）：`flex items-center gap-6 mt-6`。

主按钮：`.liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white`，包含 `Start Your Voyage` 加 ArrowUpRight 图标（`h-5 w-5`）。

次按钮：裸文本链接，包含 `View Liftoff` 加 Play 图标（`h-4 w-4`，填充）。

Stats 行（延迟 1.3s）：`flex items-stretch gap-4 mt-8`。包含两个液态玻璃卡片：`p-5 w-[220px] rounded-[1.25rem]`。

每张卡片：

- 顶部：白色 28×28 线框 SVG 图标。第一张为 clock，第二张为 globe。
- 底部：Instrument Serif italic 白色大数字，`text-4xl tracking-[-1px] leading-none`。分别为 `34.5 Min` 与 `2.8B+`。
- 下方标签：`text-xs text-white font-body font-light mt-2`。分别为 `Average Videos Watch Time` 与 `Users Across the Globe`。

### Partners（Hero 底部，延迟 1.4s）

`flex flex-col items-center gap-4 pb-8`。

液态玻璃圆角标签：`px-3.5 py-1 text-xs font-medium text-white`，文本为：

```text
Collaborating with top aerospace pioneers globally
```

5 个品牌名称一行显示，Instrument Serif italic 白色，`text-2xl md:text-3xl tracking-tight gap-12/md:gap-16`：

```text
Aeon · Vela · Apex · Orbit · Zeno
```

## BlurText 组件（逐词模糊进入）

IntersectionObserver 在 10% 可见时触发。按空格拆分文本。每个单词都是一个 `motion.span`。

初始状态：

```js
{ filter: 'blur(10px)', opacity: 0, y: 50 }
```

三段关键帧：

```js
{ filter: 'blur(5px)', opacity: 0.5, y: -5 }
{ filter: 'blur(0px)', opacity: 1, y: 0 }
```

动画参数：

- `duration: 0.7`，即 `stepDuration 0.35 × 2`
- `times: [0, 0.5, 1]`
- `ease: easeOut`
- 错峰延迟：`delay = (i * 100) / 1000` 秒
- `display: inline-block`
- `marginRight: 0.28em`

不要使用不换行空格，因为 `letter-spacing -4px` 会吞掉 `nbsp`。

父级 `<p>` 为：

```css
display: flex;
flex-wrap: wrap;
justify-content: center;
row-gap: 0.1em;
```

## Section 2：Capabilities（min-h-screen，黑色背景）

背景视频全屏铺满，不使用 120% 缩放。

- `src`：`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4`
- `class`：`absolute inset-0 w-full h-full object-cover z-0`

使用同样的 FadingVideo 处理。不添加遮罩。

内容层：`relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen`。

### Header（mb-auto）

Kicker：`text-sm font-body text-white/80 mb-6`，文本为：

```text
// Capabilities
```

标题：`font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]`。两行显示，中间使用 `<br/>`：

```text
Production
evolved
```

### 三张卡片

容器：`grid grid-cols-1 md:grid-cols-3 gap-6 mt-16`。

每张卡片：`.liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col`。

每张卡片的顶部行：`flex items-start justify-between gap-4`。

左侧：44×44 嵌套液态玻璃方形（`rounded-[0.75rem]`），内部是白色 Material Icons SVG（`fill currentColor, h-6 w-6 text-white`）。

使用的三个图标：

AI Scenery：image icon

```text
M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z
```

Batch Production：movie icon

```text
M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z
```

Smart Lighting：lightbulb icon

```text
M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z
```

右侧：`flex flex-wrap justify-end gap-1.5 max-w-[70%]`，包含 4 个小型液态玻璃胶囊标签：`rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap`。

Card 1 标签：

```text
Natural Context · Photo Realism · Infinite Settings · Eco-Vibe
```

Card 2 标签：

```text
Scale Fast · Visual Consistency · Time Saver · Ready to Post
```

Card 3 标签：

```text
Ray Tracing · Physical Shadows · Studio Quality · Sunlight Sync
```

中间为 `flex-1` 空白撑开。

每张卡片底部：`mt-6`。

标题 h3：`font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none`，分别为：

```text
AI Scenery
Batch Production
Smart Lighting
```

正文 p：`mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]`。

Card 1 正文：

```text
AI analyzes your product to create indistinguishable natural environments — from Icelandic cliffs to misty forests.
```

Card 2 正文：

```text
Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.
```

Card 3 正文：

```text
Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.
```

## 图标（内联 lucide 风格 SVG，currentColor stroke）

ArrowUpRight：24×24，`M7 17L17 7` 加 `M7 7h10v10`，`strokeWidth 2`，圆角端点。

Play：24×24，填充 polygon：`6 4 20 12 6 20 6 4`。

## 注意事项

- 所有文本为白色。
- 不使用绿色。
- 不使用渐变背景。
- 视频不使用 CSS transitions；淡入淡出必须按照 FadingVideo 规范由 rAF 驱动。
- 视频全屏铺满，不加深色遮罩；对比度来自液态玻璃界面元素。
- Framer Motion 关于列表 key 的开发警告可以用 `console.error` 过滤包装器抑制；这些警告是无害的。
- 上面的详细提示词已经捕捉了复刻该落地页所需的每一个元素、样式、动画、视频 URL 和字体。
