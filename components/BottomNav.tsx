import Link from "next/link";
import { BookOpenText, Cat, Home, ImagePlus, KeyRound } from "lucide-react";

export function BottomNav() {
  const items = [["首页", "/", Home], ["图鉴", "/cats", Cat], ["发布", "/upload", ImagePlus], ["故事", "/stories", BookOpenText], ["后台", "/admin/", KeyRound]] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="移动端导航">
      <div className="grid grid-cols-5">
        {items.map(([label, href, Icon]) => <Link key={href} href={href} className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] text-ink/60 active:bg-ink/5"><Icon size={19}/>{label}</Link>)}
      </div>
    </nav>
  );
}
