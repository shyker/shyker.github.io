"use client";
import Link from "next/link";
import { usePublicPost } from "@/components/use-public-post";
import { WhosheisClient } from "./WhosheisClient";
export default function DynamicWhosheis() {
  const { post, error } = usePublicPost("thefirst");
  if (error) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f381f1] text-white"><p>{error}</p><Link href="/">返回首页</Link></main>;
  if (!post) return <main className="min-h-screen animate-pulse bg-[#f381f1]" />;
  return <WhosheisClient content={post.content} />;
}
