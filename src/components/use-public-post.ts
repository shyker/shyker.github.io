"use client";

import { useEffect, useState } from "react";
import { contentFetch, type ContentPost } from "@/lib/content";

export function usePublicPost(slug: string) {
  const [post, setPost] = useState<ContentPost | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    contentFetch<ContentPost>(`/api/public/posts/${encodeURIComponent(slug)}`)
      .then(value => { if (active) setPost(value); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "无法读取内容"); });
    return () => { active = false; };
  }, [slug]);
  return { post, error };
}
