import fs from "fs";
import path from "path";
import LegacyBlogRedirect from "./LegacyBlogRedirect";

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
  return <LegacyBlogRedirect slug={slug} />;
}
