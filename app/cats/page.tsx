import { Search } from "lucide-react";
import { getCats } from "@/lib/server-data";
import { CatCard } from "@/components/CatCard";

export default async function CatsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams; const q = (params.q || "").toLowerCase();
  const cats = await getCats();
  const filtered = cats.filter(cat => (!q || [cat.name, ...cat.aliases, cat.coat, cat.area].join(" ").toLowerCase().includes(q)) && (!params.status || params.status === "all" || cat.status === params.status));
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16"><p className="eyebrow">CAT DIRECTORY</p><div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-semibold tracking-tight">猫咪图鉴</h1><p className="mt-3 text-ink/55">通过外貌特征和常见区域，找到你遇见的那一只。</p></div><p className="text-sm text-ink/45">已收录 {cats.filter(c=>c.status==="official").length} 只 · 待确认 {cats.filter(c=>c.status==="pending").length} 只</p></div>
    <form className="mt-8 grid gap-3 rounded-2xl bg-white/60 p-3 sm:grid-cols-[1fr_auto]"><label className="relative"><Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"/><input name="q" defaultValue={params.q} className="input pl-11" placeholder="搜索名字、花色、活动区域…"/></label><select name="status" defaultValue={params.status || "all"} className="input sm:w-36"><option value="all">全部档案</option><option value="official">正式档案</option><option value="pending">待确认</option></select></form>
    {filtered.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(cat=><CatCard key={cat.id} cat={cat}/>)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-ink/15 py-16 text-center"><p className="font-medium">没有找到相符的猫咪</p><p className="mt-2 text-sm text-ink/50">试试名字、毛色或更宽泛的区域。</p></div>}
  </div>;
}
