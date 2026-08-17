import Link from "next/link";
import { Cat, KeyRound, Plus } from "lucide-react";

const nav = [
  ["猫咪图鉴", "/cats"],
  ["待认领", "/identify"],
  ["猫咪故事", "/stories"],
  ["征集活动", "/campaigns"],
  ["2023 图鉴", "/archive"],
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 font-semibold tracking-tight text-ink" aria-label="猫猫图鉴首页">
          <span className="grid size-9 place-items-center rounded-full bg-ink text-cream transition-transform duration-150 group-active:scale-[.96]"><Cat size={19} /></span>
          <span>猫猫图鉴</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm text-ink/65 md:flex" aria-label="主导航">
          {nav.map(([label, href]) => <Link key={href} href={href} className="transition-colors hover:text-ink">{label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/admin/" className="btn-ghost hidden sm:inline-flex"><KeyRound size={17} /> 工作人员</Link>
          <Link href="/upload" className="btn-primary"><Plus size={17} /> 发布动态</Link>
        </div>
      </div>
    </header>
  );
}
