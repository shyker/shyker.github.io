"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  CalendarDays,
  ChevronDown,
  Feather,
  FileText,
  Hash,
  Image,
  Loader2,
  Moon,
  MoreHorizontal,
  Pencil,
  Tag,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { DiaryEntry } from "@/lib/diaries";
import { DIARY_API_BASE, fetchDiaries } from "@/lib/diaries";
import DiaryUpload from "@/components/DiaryUpload";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface DiaryGroup {
  key: string;
  label: string;
  entries: DiaryEntry[];
}

function formatMonth(date: string) {
  const [year, month] = date.split("-");
  return `${year}.${month}`;
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function groupDiaries(diaries: DiaryEntry[]): DiaryGroup[] {
  const grouped = new Map<string, DiaryEntry[]>();
  diaries.forEach((entry) => {
    const key = entry.date.slice(0, 7);
    grouped.set(key, [...(grouped.get(key) ?? []), entry]);
  });
  return Array.from(grouped.entries()).map(([key, entries]) => ({
    key,
    label: formatMonth(key),
    entries,
  }));
}

/** Parse a comma-separated tags string into a cleaned array */
function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/** Join an array of tags back to a comma-separated string */
function joinTags(tags: string[]): string {
  return tags.filter((t) => t.trim().length > 0).join(", ");
}

// ---------------------------------------------------------------------------
// Edit mode
// ---------------------------------------------------------------------------

type EditMode = null | "rename" | "date" | "content" | "tags";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiariesClient() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- Tag & sort state ---
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const groups = useMemo(() => {
    const sorted = [...diaries].sort((a, b) =>
      sortOrder === "desc"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    );
    return groupDiaries(sorted);
  }, [diaries, sortOrder]);
  // --- Auth state ---
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState("");

  const authHeaders = useMemo((): Record<string, string> => {
    return authPassword ? { "X-Diary-Password": authPassword } : {};
  }, [authPassword]);

  // Auto-check saved password on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("diary-password");
    if (saved) {
      setAuthPassword(saved);
      // Verify the saved password is still valid
      fetch(`${DIARY_API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: saved }),
      })
        .then((res) => {
          if (res.ok) {
            setAuthChecked(true);
          } else {
            sessionStorage.removeItem("diary-password");
            setAuthPassword("");
          }
        })
        .catch(() => {
          sessionStorage.removeItem("diary-password");
          setAuthPassword("");
        })
        .finally(() => setAuthChecking(false));
    } else {
      setAuthChecking(false);
    }
  }, []);

  // --- Image upload ---
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${DIARY_API_BASE}/api/diaries/images`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const { url } = await res.json();
      // Insert Markdown image syntax at cursor
      const md = `![](${url})`;
      const ta = editTextareaRef.current;
      if (ta) {
        const start = ta.selectionStart;
        ta.setRangeText(md, start, ta.selectionEnd, "end");
        setEditValue(ta.value);
        ta.focus();
      } else {
        setEditValue((prev) => prev + md);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
      // Reset the input so the same file can be re-selected
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, [authHeaders]);

  const handleLogin = useCallback(async (password: string) => {
    setAuthError("");
    try {
      const res = await fetch(`${DIARY_API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthPassword(password);
        setAuthChecked(true);
        sessionStorage.setItem("diary-password", password);
      } else {
        setAuthError("Invalid password");
      }
    } catch {
      setAuthError("Cannot reach server");
    }
  }, []);

  const [activeSlug, setActiveSlug] = useState("");
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // --- Sidebar sort menu ---
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const sidebarMenuRef = useRef<HTMLDivElement>(null);

  // --- Edit state ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editValue, setEditValue] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- Fetch diaries from Java backend ---
  const loadDiaries = useCallback(async () => {
    try {
      setFetchError(null);
      const data = await fetchDiaries(DIARY_API_BASE, authHeaders);
      setDiaries(data);
      if (data.length > 0) {
        setActiveSlug((prev) => (data.find((d) => d.slug === prev) ? prev : data[0].slug));
        setOpenGroups((prev) =>
          prev.length === 0 && data.length > 0 ? [data[0].date.slice(0, 7)] : prev,
        );
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load diaries");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  // --- Close menus on outside click ---
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setDeleteConfirm(false);
      }
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(e.target as Node)) {
        setSidebarMenuOpen(false);
      }
    };
    if (menuOpen || sidebarMenuOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [menuOpen, sidebarMenuOpen]);

  // --- Focus inputs when entering edit mode ---
  useEffect(() => {
    if (editMode === "content" && editTextareaRef.current) {
      editTextareaRef.current.focus();
    } else if (editMode === "tags" && tagInputRef.current) {
      tagInputRef.current.focus();
    } else if (editMode && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editMode]);

  // --- Collective tags from all entries ---
  const allTags = useMemo(() => {
    const set = new Set<string>();
    diaries.forEach((d) => parseTags(d.tags).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [diaries]);

  // --- Filtered & sorted entries (when tag selected) ---
  const filteredDiaries = useMemo(() => {
    const list = selectedTag
      ? diaries.filter((d) => parseTags(d.tags).includes(selectedTag))
      : diaries;
    return [...list].sort((a, b) =>
      sortOrder === "desc"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    );
  }, [diaries, selectedTag, sortOrder]);

  // --- Upload handler ---
  const handleUploaded = useCallback((entry: DiaryEntry) => {
    setDiaries((prev) => [entry, ...prev]);
    setActiveSlug(entry.slug);
    setSelectedTag(null);
    const groupKey = entry.date.slice(0, 7);
    setOpenGroups((prev) => (prev.includes(groupKey) ? prev : [...prev, groupKey]));
  }, []);

  const activeDiary = diaries.find((entry) => entry.slug === activeSlug) ?? diaries[0];

  // --- TOC from active diary content ---
  const toc = useMemo(() => {
    if (!activeDiary) return [];
    return activeDiary.content
      .split("\n")
      .filter((line) => line.match(/^#{2,3}\s/))
      .map((line) => {
        const level = (line.match(/^#+/) || ["##"])[0].length;
        const text = line.replace(/^#+\s/, "").trim();
        const id = text.toLowerCase().replace(/[^\w一-龥]/g, "-");
        return { level, text, id };
      });
  }, [activeDiary]);

  const toggleGroup = (key: string) => {
    setOpenGroups((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  // --- Edit actions ---
  const openEdit = (mode: EditMode) => {
    if (!activeDiary) return;
    setMenuOpen(false);
    setActionError(null);
    setEditMode(mode);
    if (mode === "rename") setEditValue(activeDiary.title);
    else if (mode === "date") setEditValue(activeDiary.date);
    else if (mode === "content") setEditValue(activeDiary.content);
    else if (mode === "tags") {
      setEditTags(parseTags(activeDiary.tags));
      setEditTagInput("");
    }
  };

  const cancelEdit = () => {
    setEditMode(null);
    setEditValue("");
    setEditTags([]);
    setEditTagInput("");
    setActionError(null);
  };

  const addTag = () => {
    const t = editTagInput.trim();
    if (t && !editTags.includes(t)) {
      setEditTags((prev) => [...prev, t]);
    }
    setEditTagInput("");
    tagInputRef.current?.focus();
  };

  const removeTag = (t: string) => {
    setEditTags((prev) => prev.filter((x) => x !== t));
  };

  const handleTagKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Escape") cancelEdit();
  };

  const saveEdit = useCallback(async () => {
    if (!activeDiary) return;
    setEditSaving(true);
    setActionError(null);

    try {
      const body: Record<string, string> = {};
      if (editMode === "rename") body.title = editValue;
      if (editMode === "date") body.date = editValue;
      if (editMode === "content") body.content = editValue;
      if (editMode === "tags") body.tags = joinTags(editTags);

      const res = await fetch(`${DIARY_API_BASE}/api/diaries/${activeDiary.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Update failed (${res.status})`);
      }

      const updated: DiaryEntry = await res.json();

      setDiaries((prev) =>
        prev.map((d) => (d.slug === activeDiary.slug ? updated : d)),
      );
      setEditMode(null);
      setEditValue("");
      setEditTags([]);
      setEditTagInput("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setEditSaving(false);
    }
  }, [activeDiary, editMode, editValue, editTags, authHeaders]);

  const handleEditKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") cancelEdit();
    if (e.key === "Enter" && editMode !== "content" && editMode !== "tags") saveEdit();
    if (e.key === "Enter" && e.ctrlKey && (editMode === "content" || editMode === "tags")) saveEdit();
  };

  const confirmDelete = useCallback(async () => {
    if (!activeDiary) return;
    setDeleteConfirm(false);
    setMenuOpen(false);
    setActionError(null);

    try {
      const res = await fetch(`${DIARY_API_BASE}/api/diaries/${activeDiary.slug}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);

      const slug = activeDiary.slug;
      setDiaries((prev) => prev.filter((d) => d.slug !== slug));
      setDiaries((prev) => {
        if (prev.length > 0) setActiveSlug(prev[0].slug);
        return prev;
      });
      setSelectedTag(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Delete failed");
    }
  }, [activeDiary, authHeaders]);

  // =====================================================================
  // RENDER
  // =====================================================================

  // --- Login overlay ---
  if (!authChecked) {
    return (
      <main className="relative h-screen overflow-hidden bg-[#000488] text-white flex items-center justify-center">
        <div className="relative z-10 w-full max-w-sm mx-auto px-6">
          <div className="mb-10 text-center">
            <p className="mb-3 text-[10px] uppercase tracking-[0.55em] text-white/30">Diaries</p>
            <h1 className="text-3xl font-semibold italic tracking-normal text-white">
              Daily records
            </h1>
          </div>

          {authChecking ? (
            <div className="flex items-center justify-center gap-3 py-12 text-white/25">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.3em]">Verifying…</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const pw = new FormData(e.currentTarget).get("password") as string;
                handleLogin(pw);
              }}
              className="space-y-4"
            >
              <input
                type="password"
                name="password"
                placeholder="Password"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/80 outline-none focus:border-orange-400/50 placeholder:text-white/15 transition-colors"
              />
              {authError && (
                <p className="text-[10px] text-red-300/70 text-center">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-orange-500/15 border border-orange-400/20 text-xs text-orange-300 hover:bg-orange-500/25 transition-colors font-semibold uppercase tracking-[0.2em]"
              >
                Enter
              </button>
            </form>
          )}
        </div>

        {/* Glow */}
        <div className="pointer-events-none fixed right-[-12%] top-[35%] z-0 h-[560px] w-[680px] rounded-full bg-orange-500/25 blur-[120px]" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-orange-500/5 mix-blend-overlay" />
      </main>
    );
  }

  return (
    <main className="relative h-screen overflow-hidden bg-[#000488] text-white">
      <div className="relative z-10 mx-auto grid h-full w-full max-w-7xl grid-cols-1 overflow-y-auto gap-10 px-6 py-10 lg:grid-cols-[300px_1fr] lg:overflow-hidden lg:px-10 xl:px-10">
        {/* ============ SIDEBAR (fixed on desktop) ============ */}
        <aside className="flex flex-col lg:h-full lg:overflow-hidden">
          <a
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-white/35 transition hover:text-white shrink-0"
          >
            <Moon className="h-3.5 w-3.5" />
            Home
          </a>

          <div className="mb-10 shrink-0">
            <p className="mb-3 text-[10px] uppercase tracking-[0.55em] text-white/30">
              Diaries
            </p>
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-4xl font-semibold italic tracking-normal text-white">
                Daily records
              </h1>
              {/* ---- Sidebar sort menu ---- */}
              <div className="relative" ref={sidebarMenuRef}>
                <button
                  type="button"
                  onClick={() => setSidebarMenuOpen((prev) => !prev)}
                  className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
                  aria-label="Sort options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {sidebarMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-white/10 bg-[#0a0e5a]/95 backdrop-blur-xl shadow-2xl py-1.5 overflow-hidden z-40">
                    <button
                      type="button"
                      onClick={() => { setSortOrder("desc"); setSidebarMenuOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-xs transition-colors ${sortOrder === "desc" ? "text-orange-300 bg-orange-500/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                    >
                      <ArrowDownWideNarrow className="h-3.5 w-3.5 shrink-0" />
                      Newest first
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSortOrder("asc"); setSidebarMenuOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-xs transition-colors ${sortOrder === "asc" ? "text-orange-300 bg-orange-500/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                    >
                      <ArrowUpWideNarrow className="h-3.5 w-3.5 shrink-0" />
                      Oldest first
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 shrink-0">
            <DiaryUpload apiBase={DIARY_API_BASE} onUploaded={handleUploaded} authHeaders={authHeaders} />
          </div>

          {loading && (
            <div className="flex items-center gap-3 py-8 text-white/25 shrink-0">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.3em]">Loading…</span>
            </div>
          )}

          {fetchError && (
            <div className="rounded-lg border border-red-400/20 bg-red-500/5 p-4 shrink-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-300/70">{fetchError}</p>
              <button
                type="button"
                onClick={loadDiaries}
                className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !fetchError && (
            <>
              <nav className="custom-scrollbar flex-1 overflow-y-auto pr-3 min-h-0">
                {groups.map((group) => {
                  const isOpen = openGroups.includes(group.key);
                  return (
                    <section key={group.key} className="border-t border-white/10 py-4">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.key)}
                        className="group flex w-full items-center justify-between text-left"
                      >
                        <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/55 group-hover:text-white">
                          {group.label}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-white/35 transition group-hover:text-white ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <ol className="mt-4 space-y-2">
                          {group.entries.map((entry) => {
                            const isActive = entry.slug === activeDiary?.slug;
                            return (
                              <li key={entry.slug}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveSlug(entry.slug);
                                    setSelectedTag(null);
                                  }}
                                  className={`group flex w-full items-start gap-3 px-1 py-2 text-left transition ${isActive ? "text-white" : "text-white/45 hover:text-white"}`}
                                >
                                  <span
                                    className={`mt-2 h-1 w-1 shrink-0 rounded-full transition ${isActive ? "bg-orange-400" : "bg-white/15 group-hover:bg-white/60"}`}
                                  />
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm">{entry.title}</span>
                                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
                                      {entry.date}
                                    </span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </section>
                  );
                })}
              </nav>

              {/* ---- Tag collection ---- */}
              {allTags.length > 0 && (
                <div className="shrink-0 mt-6 pt-4 border-t border-white/10">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-white/25">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedTag(selectedTag === tag ? null : tag);
                          if (filteredDiaries.length > 0) {
                            // keep current article if it has the tag
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.15em] transition-colors border ${
                          selectedTag === tag
                            ? "bg-orange-500/15 border-orange-400/30 text-orange-300"
                            : "bg-white/[0.03] border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"
                        }`}
                      >
                        <Hash className="h-2.5 w-2.5" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </aside>

        {/* ============ MAIN CONTENT ============ */}
        <section className="min-w-0 lg:h-full lg:overflow-y-auto lg:pt-12 content-scroll">
          {/* ---- Tag-filtered list view ---- */}
          {selectedTag ? (
            <div className="max-w-3xl pb-32 lg:pb-20">
              <div className="mb-10 border-b border-white/10 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.45em] text-white/30">
                      Filtered by tag
                    </p>
                    <h2 className="text-3xl font-semibold italic text-white inline-flex items-center gap-2">
                      <Hash className="h-5 w-5 text-orange-400" />
                      {selectedTag}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {filteredDiaries.length === 0 ? (
                <div className="font-mono text-xs uppercase tracking-[0.35em] text-white/25">
                  No entries with this tag.
                </div>
              ) : (
                <ol className="space-y-1">
                  {filteredDiaries.map((d) => (
                    <li key={d.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSlug(d.slug);
                          setSelectedTag(null);
                        }}
                        className="flex w-full items-center justify-between gap-4 px-3 py-3 rounded-lg text-left hover:bg-white/[0.03] transition-colors group"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-white/80 group-hover:text-white transition-colors">
                            {d.title}
                          </span>
                          {d.summary && (
                            <span className="block mt-1 truncate text-[11px] text-white/25">
                              {d.summary}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
                          {d.date}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : activeDiary ? (
            <article className="max-w-3xl relative pb-32 lg:pb-20">
              {/* ---- "..." dropdown menu ---- */}
              <div className="absolute top-0 right-0 z-30" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => { setMenuOpen((prev) => !prev); setDeleteConfirm(false); }}
                  className="p-2 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/5 transition-colors"
                  aria-label="Entry actions"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-[#0a0e5a]/95 backdrop-blur-xl shadow-2xl py-1.5 overflow-hidden z-40">
                    <button type="button" onClick={() => openEdit("rename")} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                      <Pencil className="h-3.5 w-3.5 shrink-0" /> Rename
                    </button>
                    <button type="button" onClick={() => openEdit("date")} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" /> Edit date
                    </button>
                    <button type="button" onClick={() => openEdit("tags")} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                      <Tag className="h-3.5 w-3.5 shrink-0" /> Edit tags
                    </button>
                    <button type="button" onClick={() => openEdit("content")} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                      <FileText className="h-3.5 w-3.5 shrink-0" /> Edit content
                    </button>
                    <div className="mx-3 my-1 border-t border-white/5" />
                    {deleteConfirm ? (
                      <div className="px-4 py-2">
                        <p className="text-[10px] text-red-300/70 mb-2 leading-relaxed">Delete this entry?</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={confirmDelete} className="flex-1 py-1.5 rounded-md bg-red-500/15 border border-red-400/20 text-[10px] text-red-300 hover:bg-red-500/25 transition-colors font-semibold uppercase tracking-[0.15em]">Yes</button>
                          <button type="button" onClick={() => setDeleteConfirm(false)} className="flex-1 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-[0.15em]">No</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeleteConfirm(true)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-red-300/70 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                        <Trash2 className="h-3.5 w-3.5 shrink-0" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ---- Header ---- */}
              <div className="mb-10 border-b border-white/10 pb-8">
                {/* Meta row */}
                <div className="mb-5 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-white/35">
                  {editMode === "date" ? (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <input ref={editInputRef} type="date" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleEditKey} className="bg-white/5 border border-white/15 rounded-md px-2 py-0.5 text-[11px] text-white/80 font-mono tracking-[0.15em] outline-none focus:border-orange-400/50 w-[140px]" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(activeDiary.date)}
                    </span>
                  )}
                  {activeDiary.mood && (
                    <span className="inline-flex items-center gap-2"><Feather className="h-3.5 w-3.5" />{activeDiary.mood}</span>
                  )}
                  {activeDiary.weather && <span>{activeDiary.weather}</span>}
                </div>

                {/* ---- Tag chips ---- */}
                {editMode === "tags" ? (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {editTags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-400/25 text-[10px] text-orange-300 tracking-[0.15em]">
                          <Hash className="h-2.5 w-2.5" />
                          {t}
                          <button type="button" onClick={() => removeTag(t)} className="ml-0.5 text-orange-300/60 hover:text-orange-300">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input ref={tagInputRef} type="text" value={editTagInput} onChange={(e) => setEditTagInput(e.target.value)} onKeyDown={handleTagKey} placeholder="Add tag…" className="flex-1 bg-white/5 border border-white/15 rounded-md px-3 py-1.5 text-xs text-white/80 outline-none focus:border-orange-400/50 placeholder:text-white/15" />
                      <button type="button" onClick={addTag} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-[0.15em]">Add</button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" onClick={saveEdit} disabled={editSaving} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500/15 border border-orange-400/20 text-[10px] text-orange-300 hover:bg-orange-500/25 transition-colors font-semibold uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed">
                        {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                      </button>
                      <button type="button" onClick={cancelEdit} disabled={editSaving} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-[0.15em]">
                        <X className="h-3 w-3" /> Cancel
                      </button>
                      {actionError && <span className="text-[10px] text-red-300/70 ml-2">{actionError}</span>}
                    </div>
                  </div>
                ) : (
                  parseTags(activeDiary.tags).length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {parseTags(activeDiary.tags).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTag(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] text-white/40 hover:text-orange-300 hover:border-orange-400/30 hover:bg-orange-500/10 transition-colors tracking-[0.15em]"
                        >
                          <Hash className="h-2.5 w-2.5" />
                          {t}
                        </button>
                      ))}
                    </div>
                  )
                )}

                {/* Title */}
                {editMode === "rename" ? (
                  <div className="flex items-center gap-3">
                    <input ref={editInputRef} type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleEditKey} className="flex-1 bg-white/5 border border-white/15 rounded-md px-3 py-1.5 text-4xl md:text-5xl font-semibold italic text-white outline-none focus:border-orange-400/50" />
                  </div>
                ) : (
                  <h2 className="text-4xl font-semibold italic text-white md:text-5xl">{activeDiary.title}</h2>
                )}

                {/* Edit action bar (not for tags — tags has its own above) */}
                {editMode && editMode !== "content" && editMode !== "tags" && (
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" onClick={saveEdit} disabled={editSaving || !editValue.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500/15 border border-orange-400/20 text-[10px] text-orange-300 hover:bg-orange-500/25 transition-colors font-semibold uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed">
                      {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                    </button>
                    <button type="button" onClick={cancelEdit} disabled={editSaving} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-[0.15em]">
                      <X className="h-3 w-3" /> Cancel
                    </button>
                    {actionError && <span className="text-[10px] text-red-300/70 ml-2">{actionError}</span>}
                  </div>
                )}

                {activeDiary.summary && editMode !== "rename" && editMode !== "content" && editMode !== "tags" && (
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">{activeDiary.summary}</p>
                )}
              </div>

              {/* ---- Content ---- */}
              {editMode === "content" ? (
                <div className="pb-32">
                  <div className="mb-3 flex items-center gap-2">
                    <button type="button" onClick={saveEdit} disabled={editSaving} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500/15 border border-orange-400/20 text-[10px] text-orange-300 hover:bg-orange-500/25 transition-colors font-semibold uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed">
                      {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                    </button>
                    <button type="button" onClick={cancelEdit} disabled={editSaving} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-[0.15em]">
                      <X className="h-3 w-3" /> Cancel
                    </button>
                    <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" className="hidden" onChange={handleImageUpload} />
                    <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/10 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors uppercase tracking-[0.15em] disabled:opacity-40">
                      {uploadingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Image className="h-3 w-3" />} Image
                    </button>
                    <span className="text-[10px] text-white/25 ml-auto">Ctrl+Enter to save</span>
                    {actionError && <span className="text-[10px] text-red-300/70">{actionError}</span>}
                  </div>
                  <textarea ref={editTextareaRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleEditKey} className="w-full min-h-[60vh] bg-white/[0.03] border border-white/10 rounded-xl p-6 font-mono text-sm text-white/80 leading-relaxed outline-none focus:border-orange-400/40 resize-y placeholder:text-white/15" placeholder="Write your Markdown here…" spellCheck={false} />
                </div>
              ) : (
                <div className="prose prose-base prose-invert prose-blue max-w-none pb-32 prose-headings:italic prose-p:text-white/70 prose-li:text-white/65 prose-strong:text-white">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => {
                        const id = String(children).toLowerCase().replace(/[^\w一-龥]/g, "-");
                        return <h2 id={id}>{children}</h2>;
                      },
                      h3: ({ children }) => {
                        const id = String(children).toLowerCase().replace(/[^\w一-龥]/g, "-");
                        return <h3 id={id}>{children}</h3>;
                      },
                      code: ({ className, children, ...props }) => {
                        // Code blocks have className (language-xxx) or contain line breaks
                        const isBlock = className != null || (typeof children === "string" && /[\r\n]/.test(children));
                        if (isBlock) {
                          return <code className={className} {...props}>{children}</code>;
                        }
                        // Inline code: subtle background to distinguish from body text
                        return (
                          <code className="rounded bg-white/[0.06] px-1 py-px text-[0.875em] text-white/75" {...props}>
                            {children}
                          </code>
                        );
                      },
                      img: ({ src, alt, ...props }) => {
                        if (!src || typeof src !== "string") return null;
                        return (
                          <span className="block my-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20">
                            <img
                              src={src}
                              alt={alt || "diary-image"}
                              className="w-full h-auto opacity-95 hover:opacity-100 transition-opacity duration-500"
                              {...props}
                            />
                          </span>
                        );
                      },
                    }}
                  >
                    {activeDiary.content}
                  </ReactMarkdown>
                </div>
              )}
            </article>
          ) : loading ? (
            <div className="pt-20 flex items-center gap-3 text-white/20">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-mono text-xs uppercase tracking-[0.35em]">Loading entries…</span>
            </div>
          ) : (
            <div className="pt-20 font-mono text-xs uppercase tracking-[0.35em] text-white/30">No diary entries yet.</div>
          )}

          {/* ---- TOC nav ---- */}
          {!selectedTag && toc.length > 0 && (
            <nav className="fixed z-[100] hidden xl:block pointer-events-auto rounded-2xl p-6 shadow-2xl transition-all duration-300" 
            style={{ top: "70px", right: "-30px", width: "240px" }}>
              <ul className="space-y-2 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
                {toc.map((item, index) => (
                  <li key={index} style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }} className="group">
                    <a href={`#${item.id}`} className="text-[11px] leading-relaxed text-white/40 hover:text-white transition-all duration-200 flex items-start gap-2">
                      <span className="mt-1.5 w-0.5 h-0.5 bg-white/10 group-hover:bg-orange-500 rounded-full transition-all shrink-0" />
                      <span className="truncate group-hover:italic">{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </section>
      </div>

      {/* Ambient glow layers */}
      <div className="pointer-events-none fixed right-[-12%] top-[35%] z-0 h-[560px] w-[680px] rounded-full bg-orange-500/25 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-orange-500/5 mix-blend-overlay" />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(249, 115, 22, 0.35); }
        .content-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .content-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}
