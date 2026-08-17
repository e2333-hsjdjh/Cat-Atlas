import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({ eyebrow, title, href, action = "查看全部" }: { eyebrow?: string; title: string; href?: string; action?: string }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2></div>{href && <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-moss hover:text-ink">{action}<ArrowRight size={15}/></Link>}</div>;
}
