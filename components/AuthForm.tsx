"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForm() {
  const [state, setState] = useState<"idle" | "working" | "sent">("idle");
  const [error, setError] = useState("");
  async function login(formData: FormData) {
    setState("working"); setError("");
    const email = String(formData.get("email")); const supabase = getSupabaseBrowserClient();
    if (!supabase) { await new Promise(r => setTimeout(r, 500)); setState("sent"); return; }
    const { error: authError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/me` } });
    if (authError) { setError(authError.message); setState("idle"); } else setState("sent");
  }
  if (state === "sent") return <div className="text-center"><CheckCircle2 size={40} className="mx-auto text-moss"/><h2 className="mt-4 text-xl font-semibold">登录链接已发送</h2><p className="mt-2 text-sm text-ink/60">请打开邮箱并点击链接完成登录。链接将在短时间内失效。</p><button onClick={() => setState("idle")} className="btn-ghost mt-5">换一个邮箱</button></div>;
  return <form action={login} className="space-y-4"><label><span className="label">邮箱地址</span><div className="relative mt-2"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" size={18}/><input className="input pl-11" required type="email" name="email" placeholder="name@example.com"/></div></label>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}<button className="btn-primary w-full justify-center" disabled={state === "working"}>{state === "working" && <LoaderCircle size={17} className="animate-spin"/>}获取登录链接</button><p className="text-center text-xs leading-5 text-ink/45">无需密码。首次登录会自动创建账号。</p></form>;
}
