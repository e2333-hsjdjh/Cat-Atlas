"use client";

import { useState } from "react";
import { CheckCircle2, ImagePlus, Send } from "lucide-react";
import { cats } from "@/lib/data";
import { sanitizeImage } from "@/lib/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { apiUrl, djangoApiEnabled } from "@/lib/path";

export function CampaignForm({ campaignId }: { campaignId: string }) {
  const [done, setDone] = useState(false); const [file,setFile]=useState<File|null>(null); const [error,setError]=useState("");
  async function submit(formData:FormData){
    setError(""); const supabase=getSupabaseBrowserClient();
    if(supabase){const {data}=await supabase.auth.getUser(); if(!data.user){setError("请先登录后再投稿");return;} let imagePath:string|null=null;
      if(file){const clean=await sanitizeImage(file); imagePath=`${data.user.id}/campaign-${crypto.randomUUID()}.webp`; const uploaded=await supabase.storage.from("cat-photos").upload(imagePath,clean,{contentType:clean.type}); if(uploaded.error){setError(uploaded.error.message);return;}}
      const inserted=await supabase.from("campaign_submissions").insert({campaign_id:campaignId,submitter_id:data.user.id,cat_id:formData.get("cat")||null,title:formData.get("title"),body:formData.get("body"),image_path:imagePath,contact_private:formData.get("contact"),consent_granted:true}); if(inserted.error){setError(inserted.error.message);return;}
    } else if(djangoApiEnabled){formData.set("campaign_id",campaignId);formData.set("consent","true");if(file)formData.set("image",await sanitizeImage(file));const response=await fetch(apiUrl("submissions/"),{method:"POST",body:formData});const result=await response.json();if(!response.ok){setError(result.error||"投稿失败");return;}}
    else await new Promise(r=>setTimeout(r,400)); setDone(true);
  }
  if (done) return <div className="rounded-2xl bg-leaf p-6 text-center"><CheckCircle2 className="mx-auto text-moss"/><h3 className="mt-3 font-semibold">投稿已收到</h3><p className="mt-1 text-sm text-ink/60">工作人员会妥善保管联系方式，并在采用前与你确认。</p></div>;
  return <form action={submit} className="space-y-4">
    <input type="hidden" name="campaign_id" value={campaignId}/><label><span className="label">投稿标题</span><input required name="title" className="input mt-2" placeholder="给这个故事起个名字"/></label><label><span className="label">关联猫咪 <span className="font-normal text-ink/40">（可选）</span></span><select name="cat" className="input mt-2"><option value="">不关联具体猫咪</option>{cats.map(cat=><option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label><label><span className="label">投稿内容</span><textarea required name="body" className="input mt-2 min-h-32" placeholder="写下照片背后的时间、地点和故事…"/></label><label className="block cursor-pointer rounded-xl border border-dashed border-ink/15 p-4 text-sm text-ink/55"><ImagePlus size={17} className="mr-2 inline text-moss"/>{file?file.name:"添加图片（可选，最大 15MB）"}<input type="file" accept="image/*" className="sr-only" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><label><span className="label">联系方式 <span className="font-normal text-ink/40">（仅工作人员可见）</span></span><input required name="contact" className="input mt-2" placeholder="邮箱或微信号"/></label><label className="flex gap-3 text-sm text-ink/65"><input required type="checkbox" className="size-4 accent-moss"/>我同意工作人员联系我，并授权本站展示被采用的投稿。</label>{error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}<button className="btn-primary w-full justify-center"><Send size={17}/>提交投稿</button>
  </form>;
}
