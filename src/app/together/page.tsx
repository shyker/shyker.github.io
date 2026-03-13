import fs from "fs";
import path from "path";
import matter from "gray-matter";
// ❌ 错误：import { WhosheisClient } from "./TogetherClient";
// ✅ 修复：改成 TogetherClient
import { TogetherClient } from "./TogetherClient"; 

export default async function TogetherPage() { // 建议函数名也改为 TogetherPage 保持一致
  const filePath = path.join(process.cwd(), "src", "posts", "together.md");
  
  if (!fs.existsSync(filePath)) {
    return (
      <main className={`min-h-screen bg-[#000488] text-white flex items-center justify-center font-mono opacity-40 uppercase tracking-widest`}>
        404: RECORD_NOT_FOUND
      </main>
    );
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { content } = matter(fileContent);

  // ✅ 修复：这里也要改成 TogetherClient
  return <TogetherClient content={content} />; 
}