"use client";

import { useState } from "react";
import { CheckCircle2, PawPrint } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { apiUrl, djangoApiEnabled } from "@/lib/path";

export function CatApplicationForm() {
  const [done, setDone] = useState(false); const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setError(""); const supabase=getSupabaseBrowserClient();
    if (supabase) { const {data}=await supabase.auth.getUser(); if(!data.user){setError("请先登录后再申请建档");return;} const result=await supabase.from("cat_applications").insert({applicant_id:data.user.id,proposed_name:formData.get("name"),coat:formData.get("coat"),distinctive_features:formData.get("feature"),area_public:formData.get("area"),notes:formData.get("notes")}); if(result.error){setError(result.error.message);return;} }
    else if(djangoApiEnabled){const response=await fetch(apiUrl("applications/"),{method:"POST",body:formData});const result=await response.json();if(!response.ok){setError(result.error||"提交失败");return;}}
    else await new Promise(r=>setTimeout(r,400)); setDone(true);
  }
  if(done)return <div className="card py-10 text-center"><CheckCircle2 className="mx-auto text-moss"/><h3 className="mt-3 font-semibold">临时档案申请已提交</h3><p className="mt-1 text-sm text-ink/55">工作人员会先查重，再确认、合并或驳回申请。</p></div>;
  return <form action={submit} className="card grid gap-5 sm:grid-cols-2"><label><span className="label">暂定名字</span><input required name="name" className="input mt-2" placeholder="不知道时可填“未命名”"/></label><label><span className="label">大致区域</span><input required name="area" className="input mt-2" placeholder="例如：东门草坪"/></label><label><span className="label">花色</span><input required name="coat" className="input mt-2" placeholder="例如：奶油色短毛"/></label><label><span className="label">显著特征</span><input required name="feature" className="input mt-2" placeholder="耳朵、尾巴、花纹等"/></label><label><span className="label">辨认照片</span><input name="image" type="file" accept="image/*" className="input mt-2"/></label><label><span className="label">联系方式 <span className="font-normal text-ink/40">（不公开）</span></span><input name="contact" className="input mt-2" placeholder="邮箱或微信号"/></label><label className="sm:col-span-2"><span className="label">其他线索</span><textarea name="notes" className="input mt-2 min-h-24" placeholder="首次见到的时间、精神状态等；请勿填写精确窝点。"/></label>{error&&<p className="text-sm text-rose-700 sm:col-span-2">{error}</p>}<button className="btn-primary justify-center sm:col-span-2"><PawPrint size={17}/>提交建档申请</button></form>;
}
