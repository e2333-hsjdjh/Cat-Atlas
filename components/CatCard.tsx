import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Cat } from "@/lib/types";
import { CatPhoto } from "./CatPhoto";

export function CatCard({ cat }: { cat: Cat }) {
  return (
    <Link href={`/cats/${cat.slug}`} className="card group overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-leaf">
        <CatPhoto src={cat.image} alt={`${cat.name}的 2023 图鉴照片`} position={cat.imagePosition} className="transition-transform duration-300 group-hover:scale-[1.025]" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur ${cat.status === "pending" ? "bg-amber-100/90 text-amber-900" : "bg-cream/90 text-ink"}`}>{cat.status === "pending" ? "待确认" : "已建档"}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">{cat.name}</h3><p className="mt-0.5 text-xs text-ink/50">{cat.aliases.length ? `也叫 ${cat.aliases.join("、")}` : cat.coat}</p></div><span className="rounded-full bg-leaf px-2.5 py-1 text-xs text-moss">{cat.sex}</span></div>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink/60"><MapPin size={14}/>{cat.area}</p>
        <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3 text-xs text-ink/50"><span>{cat.feature}</span><span className="shrink-0">{cat.sightings} 条动态</span></div>
      </div>
    </Link>
  );
}
