"use client";
import Link from "next/link";
import { usePublicPost } from "@/components/use-public-post";
import { TogetherClient } from "./TogetherClient";
export default function DynamicTogether() {
  const { post, error } = usePublicPost("together");
  if (error) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-900 text-white"><p>{error}</p><Link href="/">返回首页</Link></main>;
  if (!post) return <main className="min-h-screen animate-pulse bg-zinc-900" />;
  return <TogetherClient content={post.content} />;
}
