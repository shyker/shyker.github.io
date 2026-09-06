"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { contentFetch, type ContentPost } from "@/lib/content";
import { BlogClient } from "./[slug]/BlogClient";

function makeToc(content: string) {
  return content.split("\n").filter(line => /^#{2,3}\s/.test(line)).map(line => {
    const level = line.match(/^#+/)?.[0].length || 2;
    const text = line.replace(/^#+\s/, "").trim();
    return { level, text, id: text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, "-") };
  });
}

export default function DynamicBlog() {
  const slug = useSearchParams().get("slug") || "";
  const [post, setPost] = useState<ContentPost | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!slug) { setError("缺少文章标识"); return; }
    contentFetch<ContentPost>(`/api/public/posts/${encodeURIComponent(slug)}`)
      .then(value => { if (active) setPost(value); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "无法读取文章"); });
    return () => { active = false; };
  }, [slug]);
  const toc = useMemo(() => makeToc(post?.content || ""), [post]);
  if (error) return <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#000488] px-6 text-center text-white"><p className="font-mono text-sm uppercase tracking-widest text-white/50">{error}</p><Link href="/" className="text-xs uppercase tracking-[0.3em]">返回首页</Link></main>;
  if (!post) return <main className="min-h-screen animate-pulse bg-[#000488]" />;
  return <BlogClient slug={post.slug} content={post.content} toc={toc} />;
}
