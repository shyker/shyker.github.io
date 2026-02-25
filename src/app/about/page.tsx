import fs from "fs";
import path from "path";
import matter from "gray-matter";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
  const filePath = path.join(process.cwd(), "src","posts", "about.md");
  
  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    return (
      <main className={`h-screen bg-[#000488] text-white flex items-center justify-center font-mono opacity-40 uppercase tracking-widest`}>
        404: RECORD_NOT_FOUND
      </main>
    );
  }

  // 读取并解析 Markdown
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  // 🚀 将解析后的数据传递给刚才修复好的客户端组件
  return <AboutClient metadata={data} content={content} />;
}