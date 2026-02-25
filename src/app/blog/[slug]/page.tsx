import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogClient } from "./BlogClient";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  /**
   * 🛠️ 路径修复：
   * 根据服务器 ls 结果，posts 与 src 平级，位于根目录。
   * 如果你本地开发时 posts 也在根目录，请确保此处移除 "src"。
   */
  const postsDir = path.join(process.cwd(), "src","posts");
  const mdPath = path.join(postsDir, `${slug}.md`);

  // 1. 检查文件是否存在
  if (!fs.existsSync(mdPath)) {
    return (
      <main className={`min-h-screen bg-[#000488] text-white flex items-center justify-center font-mono opacity-40 uppercase tracking-widest text-center`}>
        404 <br/>It's seems like I didn't write this yet
      </main>
    );
  }

  // 2. 读取并解析内容
  const fileContent = fs.readFileSync(mdPath, "utf8");
  const { content } = matter(fileContent);

  // 3. 生成目录索引 (TOC)
  const lines = content.split("\n");
  const toc = lines
    .filter((line) => line.match(/^#{2,3}\s/))
    .map((line) => {
      const level = (line.match(/^#+/) || ["##"])[0].length;
      const text = line.replace(/^#+\s/, "").trim();
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, "-");
      return { level, text, id };
    });

  // 4. 渲染之前修复好的客户端组件
  return <BlogClient slug={slug} content={content} toc={toc} />;
}