"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, RefreshCw } from "lucide-react";
import { contentFetch, publicPostHref, type ContentCategory, type ContentPost } from "@/lib/content";

export default function CategoryArchive() {
  const slug = useSearchParams().get("slug") || "";
  const [folder, setFolder] = useState<ContentCategory | null>(null);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError("");
      try {
        if (!slug) throw new Error("缺少文件夹标识");
        const [folders, records] = await Promise.all([
          contentFetch<ContentCategory[]>("/api/public/categories"),
          contentFetch<ContentPost[]>(`/api/public/posts?category=${encodeURIComponent(slug)}`),
        ]);
        if (!active) return;
        const selected = folders.find(item => item.slug === slug);
        if (!selected) throw new Error("这个文件夹不存在或尚未公开");
        setFolder(selected); setPosts(records);
      } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "无法读取档案"); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [slug]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000488] px-5 py-10 text-white sm:px-10 lg:px-20 lg:py-16">
      <div className="pointer-events-none fixed right-[-12rem] top-[20%] h-[38rem] w-[38rem] rounded-full bg-orange-500/20 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-white/45 transition hover:text-white"><ArrowLeft className="h-3.5 w-3.5" />Back to folders</Link>
        {loading && <div className="mt-16 h-96 animate-pulse rounded-2xl bg-white/5" />}
        {error && <div className="mt-16 rounded-2xl border border-red-300/20 bg-red-950/20 p-10"><p className="text-white/65">{error}</p><button onClick={() => location.reload()} className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-widest"><RefreshCw className="h-4 w-4" />重试</button></div>}
        {!loading && !error && folder && <>
          <header className="relative mt-12 overflow-hidden rounded-t-3xl border border-b-0 border-white/15 bg-[#292976] px-7 pb-16 pt-10 sm:px-12">
            {folder.coverUrl && <img src={folder.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
            <div className="absolute inset-0 bg-gradient-to-r from-[#111165]/95 to-[#000488]/50" />
            <div className="relative"><p className="font-mono text-[9px] uppercase tracking-[0.45em] text-white/35">Archive / {folder.slug}</p><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{folder.name}</h1><p className="mt-4 max-w-2xl leading-7 text-white/45">{folder.description}</p></div>
          </header>
          <section className="relative -mt-7 rounded-3xl border border-white/15 bg-[#e5ddc8] p-3 text-[#171527] shadow-[0_35px_90px_rgba(0,0,20,0.45)] sm:p-7">
            <div className="rounded-2xl border border-black/10 bg-[#f0eadb] px-4 py-3 sm:px-8">
              <div className="flex items-center justify-between border-b border-black/10 py-5 font-mono text-[9px] uppercase tracking-[0.3em] text-black/40"><span>Index of records</span><span>{posts.length} files</span></div>
              {posts.length === 0 && <p className="py-20 text-center text-sm text-black/40">这个文件夹暂时是空的。</p>}
              <ol>
                {posts.map((post, index) => <li key={post.id} className="border-b border-black/10 last:border-0">
                  <Link href={publicPostHref(post)} className="group grid gap-3 px-2 py-7 transition hover:bg-black/[0.025] sm:grid-cols-[4rem_1fr_auto] sm:items-center">
                    <span className="font-mono text-xs text-black/30">{String(index + 1).padStart(2, "0")}</span>
                    <span><strong className="block text-lg font-semibold transition group-hover:translate-x-1">{post.title}</strong><span className="mt-1.5 block max-w-2xl text-sm leading-6 text-black/45">{post.summary || "没有摘要"}</span></span>
                    <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-black/30"><FileText className="h-4 w-4" />{new Date(post.updatedAt).toLocaleDateString("zh-CN")}</span>
                  </Link>
                </li>)}
              </ol>
            </div>
          </section>
        </>}
      </div>
    </main>
  );
}
