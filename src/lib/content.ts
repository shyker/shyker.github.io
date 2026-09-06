export const CONTENT_API_BASE = (process.env.NEXT_PUBLIC_CONTENT_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081").replace(/\/$/, "");

export interface ContentCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  coverAssetId?: number | null;
  coverUrl?: string | null;
  sortOrder: number;
  visible: boolean;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export type PostStatus = "draft" | "published" | "archived";

export interface ContentPost {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  status: PostStatus;
  categoryId?: number | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  publicPath?: string | null;
  allowMissingImages: boolean;
  unresolvedImageCount: number;
  version: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentAsset {
  id: number;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  url: string;
  referenceCount: number;
  createdAt: string;
}

export async function contentFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${CONTENT_API_BASE}${path}`, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function publicPostHref(post: Pick<ContentPost, "slug" | "publicPath">): string {
  return post.publicPath || `/blog?slug=${encodeURIComponent(post.slug)}`;
}
