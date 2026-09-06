"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Archive, FilePlus2, Folder, Image as ImageIcon, LogOut, Save, Trash2, Upload } from "lucide-react";
import { CONTENT_API_BASE, type ContentAsset, type ContentCategory, type ContentPost, type PostStatus } from "@/lib/content";

type Tab = "posts" | "folders" | "images" | "import";
type PostDraft = Pick<ContentPost, "slug" | "title" | "summary" | "content" | "status" | "categoryId" | "publicPath" | "allowMissingImages" | "version">;

export default function AdminClient() {
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [folders, setFolders] = useState<ContentCategory[]>([]);
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [selected, setSelected] = useState<PostDraft | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const adminFetch = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${CONTENT_API_BASE}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
    });
    if (response.status === 401) { sessionStorage.removeItem("blog-admin-token"); setToken(""); throw new Error("登录已过期"); }
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || `Request failed (${response.status})`); }
    return response.json() as Promise<T>;
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const [nextPosts, nextFolders, nextAssets] = await Promise.all([
        adminFetch<ContentPost[]>("/api/admin/posts"), adminFetch<ContentCategory[]>("/api/admin/categories"), adminFetch<ContentAsset[]>("/api/admin/assets"),
      ]);
      setPosts(nextPosts); setFolders(nextFolders); setAssets(nextAssets);
      setSelected(current => current ? toDraft(nextPosts.find(p => p.slug === current.slug) || nextPosts[0]) : (nextPosts[0] ? toDraft(nextPosts[0]) : null));
    } catch (error) { setMessage(error instanceof Error ? error.message : "读取后台失败"); }
  }, [adminFetch, token]);

  useEffect(() => {
    const saved = sessionStorage.getItem("blog-admin-token") || "";
    if (!saved) { setChecking(false); return; }
    fetch(`${CONTENT_API_BASE}/api/admin/auth/me`, { headers: { Authorization: `Bearer ${saved}` } })
      .then(response => { if (!response.ok) throw new Error(); setToken(saved); })
      .catch(() => sessionStorage.removeItem("blog-admin-token"))
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => { if (token) void refresh(); }, [token, refresh]);

  async function login(password: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`${CONTENT_API_BASE}/api/admin/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "登录失败");
      sessionStorage.setItem("blog-admin-token", body.token); setToken(body.token);
    } catch (error) { setMessage(error instanceof Error ? error.message : "登录失败"); }
    finally { setBusy(false); }
  }

  async function savePost(nextStatus?: PostStatus) {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const saved = await adminFetch<ContentPost>(`/api/admin/posts/${encodeURIComponent(selected.slug)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...selected, status: nextStatus || selected.status }),
      });
      setSelected(toDraft(saved)); setMessage(nextStatus === "published" ? "文章已发布" : "文章已保存"); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存失败"); }
    finally { setBusy(false); }
  }

  async function createPost() {
    const slug = window.prompt("新文章 slug（字母、数字、-、_）"); if (!slug) return;
    const title = window.prompt("文章标题"); if (!title) return;
    try {
      const created = await adminFetch<ContentPost>("/api/admin/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, title, summary: "", content: `# ${title}\n\n`, status: "draft", categoryId: folders[0]?.id || null, allowMissingImages: false }) });
      await refresh(); setSelected(toDraft(created)); setTab("posts");
    } catch (error) { setMessage(error instanceof Error ? error.message : "创建失败"); }
  }

  async function deletePost() {
    if (!selected || !confirm(`永久删除 ${selected.title}？图片不会自动删除。`)) return;
    try { await adminFetch(`/api/admin/posts/${encodeURIComponent(selected.slug)}`, { method: "DELETE" }); setSelected(null); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "删除失败"); }
  }

  async function uploadAsset(file: File, insert = false) {
    const data = new FormData(); data.append("file", file);
    const asset = await adminFetch<ContentAsset>("/api/admin/assets", { method: "POST", body: data });
    setAssets(current => current.some(item => item.id === asset.id) ? current : [asset, ...current]);
    if (insert && selected) insertAtCursor(`![${file.name}](${asset.url})`);
    return asset;
  }

  function insertAtCursor(markdown: string) {
    if (!selected) return;
    const area = editorRef.current; const start = area?.selectionStart ?? selected.content.length; const end = area?.selectionEnd ?? start;
    setSelected({ ...selected, content: `${selected.content.slice(0, start)}${markdown}${selected.content.slice(end)}` });
    requestAnimationFrame(() => { area?.focus(); area?.setSelectionRange(start + markdown.length, start + markdown.length); });
  }

  if (checking) return <main className="min-h-screen animate-pulse bg-[#070727]" />;
  if (!token) return <Login busy={busy} message={message} onLogin={login} />;

  return (
    <main className="min-h-screen bg-[#070727] text-white">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#070727]/95 px-5 py-4 backdrop-blur sm:px-8">
        <div><h1 className="text-xl font-semibold">Shyler Archive</h1><p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/30">Content administration</p></div>
        <nav className="flex flex-wrap gap-1">{(["posts","folders","images","import"] as Tab[]).map(item => <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-4 py-2 text-xs uppercase tracking-wider ${tab === item ? "bg-white text-[#070727]" : "text-white/45 hover:bg-white/5 hover:text-white"}`}>{item}</button>)}</nav>
        <button onClick={() => { sessionStorage.removeItem("blog-admin-token"); setToken(""); }} className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white"><LogOut className="h-4 w-4" />退出</button>
      </header>
      {message && <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-white/15 bg-[#171746] px-5 py-3 text-sm shadow-2xl" onClick={() => setMessage("")}>{message}</div>}

      {tab === "posts" && <section className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 p-4"><button onClick={createPost} className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-semibold text-[#070727]"><FilePlus2 className="h-4 w-4" />新建文章</button><div className="space-y-1">{posts.map(post => <button key={post.id} onClick={() => setSelected(toDraft(post))} className={`w-full rounded-lg px-3 py-3 text-left ${selected?.slug === post.slug ? "bg-white/10" : "hover:bg-white/5"}`}><span className="block truncate text-sm">{post.title}</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-widest text-white/30">{post.status} · {post.categoryName || "unfiled"}</span></button>)}</div></aside>
        {selected ? <div className="min-w-0 p-5 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-3"><input value={selected.title} onChange={e => setSelected({...selected,title:e.target.value})} className="min-w-64 flex-1 bg-transparent text-3xl font-semibold outline-none" /><select value={selected.categoryId || ""} onChange={e => setSelected({...selected,categoryId:Number(e.target.value) || null})} className="rounded-lg border border-white/10 bg-[#11113b] px-3 py-2 text-xs">{folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select><select value={selected.status} onChange={e => setSelected({...selected,status:e.target.value as PostStatus})} className="rounded-lg border border-white/10 bg-[#11113b] px-3 py-2 text-xs"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
          <input value={selected.summary} onChange={e => setSelected({...selected,summary:e.target.value})} placeholder="摘要" className="mb-5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-white/30" />
          <div className="grid min-h-[60vh] overflow-hidden rounded-2xl border border-white/10 xl:grid-cols-2">
            <textarea ref={editorRef} value={selected.content} onChange={e => setSelected({...selected,content:e.target.value})} onPaste={async e => { const file = Array.from(e.clipboardData.files).find(f => f.type.startsWith("image/")); if (file) { e.preventDefault(); try { await uploadAsset(file, true); } catch (error) { setMessage(error instanceof Error ? error.message : "图片上传失败"); } } }} onDragOver={e => e.preventDefault()} onDrop={async e => { e.preventDefault(); const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/")); if (file) try { await uploadAsset(file, true); } catch (error) { setMessage(error instanceof Error ? error.message : "图片上传失败"); } }} className="min-h-[60vh] resize-none border-b border-white/10 bg-[#0b0b31] p-5 font-mono text-sm leading-7 outline-none xl:border-b-0 xl:border-r" spellCheck={false} />
            <article className="prose prose-invert max-w-none overflow-auto bg-[#10103b] p-6"><ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content}</ReactMarkdown></article>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs text-white/60 hover:text-white"><ImageIcon className="h-4 w-4" />插入图片<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={async e => { const file=e.target.files?.[0]; if(file) try { await uploadAsset(file,true); } catch(error){setMessage(error instanceof Error?error.message:"上传失败");} e.target.value=""; }} /></label><label className="flex items-center gap-2 text-xs text-white/45"><input type="checkbox" checked={selected.allowMissingImages} onChange={e => setSelected({...selected,allowMissingImages:e.target.checked})} />明确忽略未匹配本地图片</label><span className="flex-1" /><button onClick={deletePost} className="inline-flex items-center gap-2 px-3 py-2 text-xs text-red-300/60 hover:text-red-300"><Trash2 className="h-4 w-4" />永久删除</button><button disabled={busy} onClick={() => void savePost()} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-xs"><Save className="h-4 w-4" />保存</button><button disabled={busy} onClick={() => void savePost("published")} className="rounded-lg bg-white px-6 py-2.5 text-xs font-semibold text-[#070727]">发布</button></div>
        </div> : <div className="grid place-items-center text-white/25">选择或创建一篇文章</div>}
      </section>}

      {tab === "folders" && <FoldersPanel folders={folders} assets={assets} upload={file => uploadAsset(file)} adminFetch={adminFetch} refresh={refresh} notify={setMessage} />}
      {tab === "images" && <ImagesPanel assets={assets} upload={uploadAsset} adminFetch={adminFetch} refresh={refresh} notify={setMessage} />}
      {tab === "import" && <ImportPanel folders={folders} adminFetch={adminFetch} refresh={refresh} openPost={post => { setSelected(toDraft(post)); setTab("posts"); }} notify={setMessage} />}
    </main>
  );
}

function Login({ busy, message, onLogin }: { busy: boolean; message: string; onLogin: (password: string) => Promise<void> }) {
  return <main className="grid min-h-screen place-items-center bg-[#070727] px-5 text-white"><form onSubmit={e => { e.preventDefault(); void onLogin(new FormData(e.currentTarget).get("password") as string); }} className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8"><Archive className="mb-8 h-9 w-9 text-white/50" /><h1 className="text-3xl font-semibold">Archive access</h1><p className="mt-2 text-sm text-white/35">输入管理员密码继续。</p><input name="password" type="password" autoFocus className="mt-8 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/30" /><button disabled={busy} className="mt-4 w-full rounded-lg bg-white py-3 text-sm font-semibold text-[#070727]">{busy ? "验证中…" : "进入后台"}</button>{message && <p className="mt-4 text-sm text-red-300">{message}</p>}</form></main>;
}

function FoldersPanel({ folders, assets, upload, adminFetch, refresh, notify }: PanelProps & { folders: ContentCategory[]; assets: ContentAsset[]; upload: (file: File) => Promise<ContentAsset> }) {
  const empty = { id: 0, slug: "", name: "", description: "", coverAssetId: null as number | null, sortOrder: folders.length * 10 + 10, visible: true };
  const [draft, setDraft] = useState(empty);
  useEffect(() => { if (folders[0] && draft.id === 0 && !draft.name) setDraft({...folders[0], coverAssetId:folders[0].coverAssetId || null}); }, [folders, draft.id, draft.name]);
  async function save() { try { const path=draft.id?`/api/admin/categories/${draft.id}`:"/api/admin/categories"; await adminFetch(path,{method:draft.id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)}); notify("文件夹已保存"); await refresh(); } catch(error){notify(error instanceof Error?error.message:"保存失败");} }
  async function remove(){if(!draft.id||!confirm(`删除文件夹 ${draft.name}？`))return;try{await adminFetch(`/api/admin/categories/${draft.id}`,{method:"DELETE"});setDraft(empty);await refresh();}catch(error){notify(error instanceof Error?error.message:"删除失败");}}
  return <section className="grid gap-6 p-5 lg:grid-cols-[280px_1fr] lg:p-8"><aside className="space-y-2"><button onClick={()=>setDraft({...empty,sortOrder:folders.length*10+10})} className="mb-3 w-full rounded-lg bg-white px-4 py-3 text-xs font-semibold text-[#070727]">创建文件夹</button>{folders.map(folder=><button key={folder.id} onClick={()=>setDraft({...folder,coverAssetId:folder.coverAssetId||null})} className={`w-full rounded-lg p-3 text-left ${draft.id===folder.id?"bg-white/10":"hover:bg-white/5"}`}><Folder className="mb-2 h-5 w-5 text-white/35" /><span>{folder.name}</span><span className="block text-[10px] text-white/30">{folder.postCount} files</span></button>)}</aside><div className="max-w-4xl space-y-5 rounded-2xl border border-white/10 p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs text-white/40">名称<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" /></label><label className="text-xs text-white/40">Slug<input value={draft.slug} onChange={e=>setDraft({...draft,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")})} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" /></label></div><label className="block text-xs text-white/40">说明<textarea value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} className="mt-2 h-24 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" /></label><div><div className="mb-3 flex items-center justify-between"><p className="text-xs text-white/40">文件夹封面（可从图床选择）</p><label className="cursor-pointer text-[10px] uppercase tracking-wider text-white/50 hover:text-white">上传新封面<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={async e=>{const file=e.target.files?.[0];if(file)try{const asset=await upload(file);setDraft(current=>({...current,coverAssetId:asset.id}));}catch(error){notify(error instanceof Error?error.message:"上传失败");}e.target.value="";}} /></label></div><div className="grid max-h-72 grid-cols-3 gap-3 overflow-auto sm:grid-cols-5"><button onClick={()=>setDraft({...draft,coverAssetId:null})} className={`aspect-square rounded-lg border text-[10px] ${draft.coverAssetId===null?"border-white":"border-white/10"}`}>默认纹理</button>{assets.map(asset=><button key={asset.id} onClick={()=>setDraft({...draft,coverAssetId:asset.id})} className={`overflow-hidden rounded-lg border ${draft.coverAssetId===asset.id?"border-white":"border-white/10"}`}><img src={asset.url} alt={asset.originalName} className="aspect-square h-full w-full object-cover" /></button>)}</div></div><div className="flex items-center gap-4"><label className="text-xs text-white/45">排序 <input type="number" value={draft.sortOrder} onChange={e=>setDraft({...draft,sortOrder:Number(e.target.value)})} className="ml-2 w-20 rounded border border-white/10 bg-white/5 px-2 py-1" /></label><label className="text-xs text-white/45"><input type="checkbox" checked={draft.visible} onChange={e=>setDraft({...draft,visible:e.target.checked})} /> 公开显示</label><span className="flex-1" />{draft.id>0&&<button onClick={remove} className="text-xs text-red-300/60">删除</button>}<button onClick={save} className="rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-[#070727]">保存文件夹</button></div></div></section>;
}

function ImagesPanel({ assets, upload, adminFetch, refresh, notify }: PanelProps & { assets: ContentAsset[]; upload: (file: File) => Promise<ContentAsset> }) {
  async function remove(asset:ContentAsset){if(!confirm(`删除 ${asset.originalName}？`))return;try{await adminFetch(`/api/admin/assets/${asset.id}`,{method:"DELETE"});await refresh();}catch(error){notify(error instanceof Error?error.message:"删除失败");}}
  return <section className="p-5 sm:p-8"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-2xl font-semibold">图床</h2><p className="text-sm text-white/35">内容哈希去重；被引用的图片不能删除。</p></div><label className="cursor-pointer rounded-lg bg-white px-5 py-3 text-xs font-semibold text-[#070727]"><Upload className="mr-2 inline h-4 w-4" />上传图片<input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={async e=>{for(const file of Array.from(e.target.files||[]))try{await upload(file);}catch(error){notify(error instanceof Error?error.message:"上传失败");}e.target.value="";}} /></label></div><div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{assets.map(asset=><figure key={asset.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"><img src={asset.url} alt={asset.originalName} className="aspect-square w-full object-cover" /><figcaption className="p-3"><p className="truncate text-xs">{asset.originalName}</p><p className="mt-1 text-[9px] text-white/30">{(asset.sizeBytes/1024).toFixed(0)} KB · {asset.referenceCount} refs</p><div className="mt-3 flex justify-between"><button onClick={()=>{void navigator.clipboard.writeText(asset.url);notify("URL 已复制");}} className="text-[10px] text-white/45">复制 URL</button><button disabled={asset.referenceCount>0} onClick={()=>void remove(asset)} className="text-red-300/50 disabled:opacity-20"><Trash2 className="h-3.5 w-3.5" /></button></div></figcaption></figure>)}</div></section>;
}

function ImportPanel({ folders, adminFetch, refresh, openPost, notify }: PanelProps & { folders: ContentCategory[]; openPost: (post: ContentPost) => void }) {
  const [categoryId,setCategoryId]=useState<number>(folders[0]?.id||0); const [busy,setBusy]=useState(false);
  useEffect(()=>{if(!categoryId&&folders[0])setCategoryId(folders[0].id);},[folders,categoryId]);
  async function importFiles(files:File[]){const md=files.find(f=>/\.(md|zip)$/i.test(f.name));if(!md){notify("请选择一个 Markdown 或 ZIP");return;}const data=new FormData();data.append("file",md);data.append("categoryId",String(categoryId));for(const file of files){if(file===md)continue;data.append("images",file);data.append("paths",(file as File & {webkitRelativePath?:string}).webkitRelativePath||file.name);}setBusy(true);try{const result=await adminFetch<{post:ContentPost;unresolvedImages:string[]}>("/api/admin/import",{method:"POST",body:data});notify(result.unresolvedImages.length?`已保存草稿，还有 ${result.unresolvedImages.length} 张图片未匹配`:"导入完成，已保存为草稿");await refresh();openPost(result.post);}catch(error){notify(error instanceof Error?error.message:"导入失败");}finally{setBusy(false);}}
  return <section className="mx-auto max-w-3xl p-5 sm:p-10"><h2 className="text-3xl font-semibold">导入档案</h2><p className="mt-3 leading-7 text-white/40">支持单个 Markdown、Markdown 与图片一起选择、完整文件夹，或包含一篇 Markdown 和图片的 ZIP。相对路径优先匹配，同名文件只在唯一时自动匹配。</p><label className="mt-8 block text-xs text-white/40">目标文件夹<select value={categoryId} onChange={e=>setCategoryId(Number(e.target.value))} className="ml-3 rounded-lg border border-white/10 bg-[#11113b] px-4 py-2 text-white">{folders.map(folder=><option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label><div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void importFiles(Array.from(e.dataTransfer.files));}} className="mt-6 grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center"><div><Upload className="mx-auto h-8 w-8 text-white/30" /><p className="mt-4 text-sm text-white/55">拖入 Markdown + 图片或 ZIP</p><div className="mt-5 flex flex-wrap justify-center gap-3"><label className="cursor-pointer rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-[#070727]">选择文件<input type="file" multiple accept=".md,.zip,image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e=>{void importFiles(Array.from(e.target.files||[]));e.target.value="";}} /></label><label className="cursor-pointer rounded-lg border border-white/15 px-4 py-2.5 text-xs">选择整个文件夹<input type="file" multiple className="hidden" ref={node=>{if(node)node.setAttribute("webkitdirectory","");}} onChange={e=>{void importFiles(Array.from(e.target.files||[]));e.target.value="";}} /></label></div>{busy&&<p className="mt-4 text-xs text-orange-300">正在解析和上传…</p>}</div></div></section>;
}

interface PanelProps { adminFetch:<T=unknown>(path:string,init?:RequestInit)=>Promise<T>; refresh:()=>Promise<void>; notify:(message:string)=>void; }
function toDraft(post?:ContentPost):PostDraft|null{return post?{slug:post.slug,title:post.title,summary:post.summary,content:post.content,status:post.status,categoryId:post.categoryId,publicPath:post.publicPath,allowMissingImages:post.allowMissingImages,version:post.version}:null;}
