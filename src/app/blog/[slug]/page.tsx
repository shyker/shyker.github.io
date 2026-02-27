import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogClient } from "./BlogClient";

/**
 * ✨ 核心修复：添加 generateStaticParams
 * 告诉 Next.js 在构建时读取 src/posts 目录下所有的 .md 文件
 * 并为每一个文件生成一个静态页面。
 */
export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), "src", "posts");
  
  // 如果目录不存在，返回空数组防止构建崩溃
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir);

  // 过滤出 .md 文件，并去掉后缀名作为 slug
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      slug: file.replace(/\.md$/, ""),
    }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  /**
   * 🛠️ 路径保持一致：
   * 确保这里的路径与 generateStaticParams 中的路径完全对应。
   */
  const postsDir = path.join(process.cwd(), "src", "posts");
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