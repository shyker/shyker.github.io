"use client";

import { useEffect } from "react";

export default function LegacyBlogRedirect({ slug }: { slug: string }) {
  useEffect(() => { window.location.replace(`/blog?slug=${encodeURIComponent(slug)}`); }, [slug]);
  return <main className="flex min-h-screen items-center justify-center bg-[#000488] font-mono text-xs uppercase tracking-widest text-white/40">Opening record…</main>;
}
