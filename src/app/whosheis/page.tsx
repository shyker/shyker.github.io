import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { WhosheisClient } from "./WhosheisClient";

export default async function AboutPage() {
  /**
   * 🛠️ 路径保持：
   * 按照你的要求，保留 "src", "posts" 结构。
   */
  const filePath = path.join(process.cwd(), "src", "posts", "thefirst.md");
  
  // 1. 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    return (
      <main className={`min-h-screen bg-[#000488] text-white flex items-center justify-center font-mono opacity-40 uppercase tracking-widest`}>
        404: RECORD_NOT_FOUND
      </main>
    );
  }

  // 2. 读取并解析 Markdown
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { content } = matter(fileContent);

  // 3. 将解析后的内容传给客户端渲染组件
  return <WhosheisClient content={content} />;
}