"use client";

import { useState } from "react";
import { Camera, CheckCircle2, ImagePlus, LoaderCircle } from "lucide-react";
import { cats } from "@/lib/data";
import { sanitizeImage } from "@/lib/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { apiUrl, djangoApiEnabled } from "@/lib/path";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [error, setError] = useState("");

  async function choose(next: File | undefined) {
    if (!next) return;
    setError("");
    try { const clean = await sanitizeImage(next); setFile(clean); setPreview(URL.createObjectURL(clean)); }
    catch (e) { setError(e instanceof Error ? e.message : "图片处理失败"); }
  }

  async function submit(formData: FormData) {
    setState("working"); setError("");
    try {
      if (!file) throw new Error("请先选择一张照片");
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("请先登录后再发布");
        const path = `${auth.user.id}/${crypto.randomUUID()}.webp`;
        const uploaded = await supabase.storage.from("cat-photos").upload(path, file, { contentType: file.type });
        if (uploaded.error) throw uploaded.error;
        const inserted = await supabase.from("posts").insert({ author_id: auth.user.id, cat_id: formData.get("cat") || null, type: "sighting", title: formData.get("title"), body: formData.get("body"), area_public: formData.get("area"), occurred_at: formData.get("date"), image_path: path });
        if (inserted.error) throw inserted.error;
      } else if (djangoApiEnabled) {
        formData.set("image", file); const response=await fetch(apiUrl("posts/"),{method:"POST",body:formData}); const result=await response.json(); if(!response.ok)throw new Error(result.error||"发布失败");
      } else { await new Promise((resolve) => setTimeout(resolve, 700)); }
      setState("done");
    } catch (e) { setError(e instanceof Error ? e.message : "发布失败，请重试"); setState("idle"); }
  }

  if (state === "done") return <div className="card py-14 text-center"><CheckCircle2 className="mx-auto text-moss" size={42}/><h2 className="mt-4 text-xl font-semibold">动态已发布</h2><p className="mt-2 text-sm text-ink/60">感谢你为猫咪留下这条可靠的记录。</p><button className="btn-secondary mt-6" onClick={() => {setState("idle"); setFile(null); setPreview(undefined);}}>继续发布</button></div>;

  return <form action={submit} className="card space-y-5">
    <div><label className="label">照片</label><label className="relative mt-2 grid min-h-52 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-ink/20 bg-white/60 text-center transition-colors hover:border-moss">
      {preview ? <img src={preview} alt="待上传照片预览" className="absolute inset-0 size-full object-cover"/> : <span><Camera className="mx-auto text-moss"/><span className="mt-3 block text-sm font-medium">拍照或选择照片</span><span className="mt-1 block text-xs text-ink/45">会自动压缩并清除定位信息</span></span>}
      <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={(e) => choose(e.target.files?.[0])}/>
    </label></div>
    <div className="grid gap-4 sm:grid-cols-2"><label><span className="label">是哪只猫？</span><select name="cat" className="input mt-2" defaultValue=""><option value="">暂时不知道，放入待认领</option>{cats.map((cat) => <option key={cat.id} value={cat.id}>{cat.name} · {cat.coat}</option>)}</select></label><label><span className="label">拍摄日期</span><input name="date" required type="date" className="input mt-2" defaultValue="2026-08-15"/></label></div>
    <label><span className="label">大致区域 <span className="font-normal text-ink/40">（不会展示精确位置）</span></span><input name="area" required className="input mt-2" placeholder="例如：图书馆南侧"/></label>
    <label><span className="label">一句话标题</span><input name="title" required maxLength={60} className="input mt-2" placeholder="例如：今天在树荫下遇见汤圆"/></label>
    <label><span className="label">补充描述</span><textarea name="body" required maxLength={500} className="input mt-2 min-h-28 resize-y" placeholder="它当时在做什么？精神和行动状态如何？请不要公开精确藏身点。"/></label>
    <label className="flex gap-3 text-sm leading-6 text-ink/65"><input required type="checkbox" className="mt-1 size-4 accent-moss"/><span>我拥有照片的发布权，并同意在本站展示；照片中不包含未经允许的清晰人脸。</span></label>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <button disabled={state === "working"} className="btn-primary w-full justify-center">{state === "working" ? <LoaderCircle className="animate-spin" size={18}/> : <ImagePlus size={18}/>} {state === "working" ? "正在发布…" : "发布到时间线"}</button>
  </form>;
}
