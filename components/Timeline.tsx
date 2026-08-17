import { HeartPulse, MapPin, Sparkles } from "lucide-react";
import type { TimelineItem } from "@/lib/types";

export function Timeline({ items }: { items: TimelineItem[] }) {
  return <div className="space-y-3">{items.map((item) => (
    <article key={item.id} className="card relative pl-16">
      <span className={`absolute left-5 top-5 grid size-8 place-items-center rounded-full ${item.type === "健康" ? "bg-rose-100 text-rose-700" : item.type === "故事" ? "bg-amber-100 text-amber-800" : "bg-leaf text-moss"}`}>{item.type === "健康" ? <HeartPulse size={16}/> : <Sparkles size={16}/>}</span>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink/45"><span>{item.date}</span><span>·</span><span>{item.type}</span>{item.featured && <span className="badge">精选</span>}</div>
      <h3 className="mt-2 font-semibold text-ink">{item.title}</h3><p className="mt-1 text-sm leading-6 text-ink/65">{item.body}</p>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink/45"><span className="flex items-center gap-1"><MapPin size={13}/>{item.area}</span><span>记录者：{item.author}</span></div>
    </article>
  ))}</div>;
}
