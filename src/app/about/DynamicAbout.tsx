"use client";
import Link from "next/link";
import { usePublicPost } from "@/components/use-public-post";
import AboutClient from "./AboutClient";
export default function DynamicAbout() {
  const { post, error } = usePublicPost("about");
  if (error) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#000488] text-white"><p>{error}</p><Link href="/">返回首页</Link></main>;
  if (!post) return <main className="min-h-screen animate-pulse bg-[#000488]" />;
  return <AboutClient metadata={{ title: post.title }} content={post.content} />;
}
