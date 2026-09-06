// ---------------------------------------------------------------------------
// Server-side filesystem helpers — imports Node.js built-ins.
// Keep these separated from the client-safe `diaries.ts` so "use client"
// components can import types / fetchDiaries without pulling in `fs`.
// ---------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { DiaryEntry } from "./diaries";

const diariesDir = path.join(process.cwd(), "src", "diaries");

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export function getDiaries(): DiaryEntry[] {
  if (!fs.existsSync(diariesDir)) return [];

  return fs
    .readdirSync(diariesDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(diariesDir, file), "utf8");
      const { data, content } = matter(raw);

      return {
        slug,
        title: asString(data.title, slug),
        date: asString(data.date, slug),
        mood: typeof data.mood === "string" ? data.mood : undefined,
        weather: typeof data.weather === "string" ? data.weather : undefined,
        summary: typeof data.summary === "string" ? data.summary : undefined,
        content,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
