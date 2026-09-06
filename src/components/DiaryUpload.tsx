"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Check, AlertCircle, Loader2, X, Image } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DiaryEntry {
  slug: string;
  title: string;
  date: string;
  mood?: string;
  weather?: string;
  summary?: string;
  tags?: string;
  content: string;
}

interface DiaryUploadProps {
  apiBase: string;
  onUploaded: (entry: DiaryEntry) => void;
  authHeaders?: Record<string, string>;
}

/** Extracted image reference from markdown content. */
interface ImageRef {
  alt: string;       // alt text from ![...]
  fullPath: string;  // original path in the .md
  filename: string;  // just the filename (last segment)
}

/** ImageRef + optional matched File provided by user. */
interface MatchedImage extends ImageRef {
  file?: File;
}

type UploadState =
  | { phase: "idle" }
  | { phase: "analyzing" }
  | { phase: "ready"; file: File; images: MatchedImage[] }
  | { phase: "uploading" }
  | { phase: "success"; entry: DiaryEntry }
  | { phase: "error"; message: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse all local image references from markdown content. */
function parseImageRefs(md: string): ImageRef[] {
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const refs: ImageRef[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const alt = m[1];
    const fullPath = m[2];
    // Skip web URLs
    if (/^https?:\/\//i.test(fullPath) || fullPath.startsWith("//")) continue;
    // Skip already-served paths
    if (fullPath.startsWith("/diaries/images") || fullPath.startsWith("/api/diaries/images")) continue;
    const filename = fullPath.replace(/^.*[/\\]/, "");
    if (filename) refs.push({ alt, fullPath, filename });
  }
  return refs;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiaryUpload({ apiBase, onUploaded, authHeaders }: DiaryUploadProps) {
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const mdInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  // ---- Analyze .md: read content + extract image refs ----
  const analyze = useCallback(async (file: File) => {
    setState({ phase: "analyzing" });
    try {
      const text = await file.text();
      const refs = parseImageRefs(text);
      setState({ phase: "ready", file, images: refs.map((r) => ({ ...r })) });
    } catch {
      setState({ phase: "error", message: "Failed to read .md file" });
    }
  }, []);

  // ---- Match newly-provided image files against referenced images ----
  const matchImages = useCallback((newFiles: FileList | File[]) => {
    setState((prev) => {
      if (prev.phase !== "ready") return prev;
      const arr = Array.from(newFiles);
      const updated = prev.images.map((img) => {
        if (img.file) return img; // already matched
        const match = arr.find((f) => f.name === img.filename);
        return match ? { ...img, file: match } : img;
      });
      return { ...prev, images: updated };
    });
  }, []);

  // ---- Remove a matched image (un-match it) ----
  const removeImage = useCallback((filename: string) => {
    setState((prev) => {
      if (prev.phase !== "ready") return prev;
      return {
        ...prev,
        images: prev.images.map((img) =>
          img.filename === filename ? { ...img, file: undefined } : img,
        ),
      };
    });
  }, []);

  // ---- Upload .md + matched images to backend ----
  const doUpload = useCallback(async (file: File, images: MatchedImage[]) => {
    setState({ phase: "uploading" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      for (const img of images) {
        if (img.file) fd.append("images", img.file);
      }

      const res = await fetch(`${apiBase}/api/diaries/upload-with-images`, {
        method: "POST",
        headers: authHeaders,
        body: fd,
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || `Upload failed (${res.status})`);
      }

      const entry: DiaryEntry = await res.json();
      setState({ phase: "success", entry });
      onUploaded(entry);
      setTimeout(() => setState({ phase: "idle" }), 4000);
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Upload failed" });
    }
  }, [apiBase, onUploaded, authHeaders]);

  // ---- .md file picked via file dialog ----
  const onMdPicked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const n = f.name.toLowerCase();
    if (!n.endsWith(".md") && !n.endsWith(".markdown")) {
      setState({ phase: "error", message: "Only .md files accepted" });
      return;
    }
    analyze(f);
  }, [analyze]);

  // ---- Image files picked via file dialog ----
  const onImagesPicked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      matchImages(e.target.files);
    }
    // Reset so the same files can be re-selected
    if (imgInputRef.current) imgInputRef.current.value = "";
  }, [matchImages]);

  // ---- Drop handler: auto-separate .md + images ----
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    let md: File | null = null;
    const droppedImgs: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const n = f.name.toLowerCase();
      if (n.endsWith(".md") || n.endsWith(".markdown")) {
        if (!md) md = f;
      } else if (/\.(png|jpe?g|gif|webp|svg)$/i.test(n)) {
        droppedImgs.push(f);
      }
    }

    if (!md) {
      setState({ phase: "error", message: "Drop a .md file (optionally with its images)" });
      return;
    }

    // Analyze .md then auto-match any provided images
    (async () => {
      setState({ phase: "analyzing" });
      try {
        const text = await md!.text();
        const refs = parseImageRefs(text);
        const images: MatchedImage[] = refs.map((r) => {
          const match = droppedImgs.find((f) => f.name === r.filename);
          return { ...r, file: match };
        });
        setState({ phase: "ready", file: md!, images });
      } catch {
        setState({ phase: "error", message: "Failed to read .md file" });
      }
    })();
  }, []);

  // ---- Derived ----
  const totalCount = state.phase === "ready" ? state.images.length : 0;
  const matchedCount = state.phase === "ready" ? state.images.filter((i) => i.file).length : 0;
  const allMatched = totalCount > 0 && matchedCount === totalCount;

  // ---- Styles ----
  const boxBase =
    "relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-5 text-center transition-all duration-300 cursor-pointer";

  const boxStyle = (() => {
    if (state.phase === "error") return `${boxBase} border-red-400/50 bg-red-500/5`;
    if (state.phase === "success") return `${boxBase} border-orange-400/40 bg-orange-500/5`;
    if (dragOver) return `${boxBase} border-orange-400/60 bg-orange-500/10 scale-[1.02]`;
    return `${boxBase} border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]`;
  })();

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <div className="space-y-3">
      {/* ---- Drop zone / status area ---- */}
      <div
        className={boxStyle}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onClick={() => {
          if (state.phase === "idle" || state.phase === "error") mdInputRef.current?.click();
        }}
      >
        <input
          ref={mdInputRef}
          type="file"
          accept=".md,.markdown,text/markdown"
          className="hidden"
          onChange={onMdPicked}
        />

        {/* idle */}
        {state.phase === "idle" && (
          <>
            <Upload className="h-5 w-5 text-white/25" />
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
              Drop .md + images, or click
            </p>
          </>
        )}

        {/* analyzing */}
        {state.phase === "analyzing" && (
          <>
            <Loader2 className="h-5 w-5 text-orange-400 animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              Reading article…
            </span>
          </>
        )}

        {/* ready / uploading */}
        {(state.phase === "ready" || state.phase === "uploading") && (
          <>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-400 shrink-0" />
              <span className="text-xs text-white/70 truncate max-w-[180px]">
                {state.phase === "ready" ? state.file.name : "Uploading…"}
              </span>
            </div>
            <span className="font-mono text-[10px] text-white/25">
              {(state.phase === "ready" ? (state.file.size / 1024).toFixed(1) : "…")} KB
              {totalCount > 0 && ` · ${totalCount} image${totalCount > 1 ? "s" : ""} found`}
              {matchedCount > 0 && matchedCount < totalCount && ` · ${matchedCount}/${totalCount} ready`}
              {allMatched && " · all ready"}
            </span>
            {state.phase === "uploading" && (
              <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
            )}
          </>
        )}

        {/* success */}
        {state.phase === "success" && (
          <>
            <Check className="h-5 w-5 text-orange-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-orange-400">
              Published — {state.entry.title}
            </span>
          </>
        )}

        {/* error */}
        {state.phase === "error" && (
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-[10px] text-red-300/80 leading-relaxed">{state.message}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setState({ phase: "idle" }); }}
              className="text-white/25 hover:text-white/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ---- Image reference list + actions (only in "ready") ---- */}
      {state.phase === "ready" && (
        <>
          {/* Image refs */}
          {totalCount > 0 && (
            <div className="space-y-1 rounded-xl border border-white/5 bg-white/[0.01] p-3">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 mb-2">
                Images in this article
              </p>
              {state.images.map((img) => (
                <div
                  key={img.filename}
                  className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] ${
                    img.file ? "text-orange-300/80" : "text-white/30"
                  }`}
                >
                  {img.file ? (
                    <Check className="h-3 w-3 text-orange-400 shrink-0" />
                  ) : (
                    <span className="w-3 h-3 shrink-0 rounded-full border border-white/10" />
                  )}
                  <span className="truncate font-mono">{img.filename}</span>
                  <span className="text-white/15 shrink-0 hidden sm:inline">
                    {img.fullPath.length > 60
                      ? "…" + img.fullPath.slice(-57)
                      : img.fullPath}
                  </span>
                  {img.file && (
                    <button
                      type="button"
                      onClick={() => removeImage(img.filename)}
                      className="ml-auto text-white/20 hover:text-white/50 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalCount === 0 && (
            <p className="text-[9px] text-white/20 text-center">
              No local images found in this article.
              <br />
              You can still add images manually below.
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <input
              ref={imgInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
              className="hidden"
              onChange={onImagesPicked}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); imgInputRef.current?.click(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/10 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors uppercase tracking-[0.15em]"
            >
              <Image className="h-3 w-3" />
              {totalCount > 0 ? `Pick images (${matchedCount}/${totalCount})` : "Add images"}
            </button>

            <button
              type="button"
              onClick={() => doUpload(state.file, state.images)}
              className="group relative flex-1 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/25 transition-all duration-500 rounded-sm uppercase tracking-[0.3em] text-[10px] font-bold flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              <Upload className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">
                Publish Entry{matchedCount > 0 ? ` + ${matchedCount} image${matchedCount > 1 ? "s" : ""}` : ""}
              </span>
            </button>
          </div>

          {/* New .md button */}
          <button
            type="button"
            onClick={() => { setState({ phase: "idle" }); if (mdInputRef.current) mdInputRef.current.value = ""; }}
            className="block mx-auto text-[9px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-[0.2em]"
          >
            Choose a different .md
          </button>
        </>
      )}
    </div>
  );
}
