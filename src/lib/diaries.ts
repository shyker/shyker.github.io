// ---------------------------------------------------------------------------
// Shared types and client-safe API helpers — NO Node.js imports here.
// ---------------------------------------------------------------------------

export interface DiaryEntry {
  slug: string;
  title: string;
  date: string;
  mood?: string;
  weather?: string;
  summary?: string;
  tags?: string;
  content: string;
}

/** Base URL of the Java diary API. */
export const DIARY_API_BASE =
  process.env.NEXT_PUBLIC_DIARY_API_URL || "http://localhost:8081";

/** Fetches all diary entries from the Java backend. */
export async function fetchDiaries(
  apiBase: string = DIARY_API_BASE,
  headers?: Record<string, string>,
): Promise<DiaryEntry[]> {
  const res = await fetch(`${apiBase}/api/diaries`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch diaries (${res.status})`);
  }
  return res.json();
}
