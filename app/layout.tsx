import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { asset } from "@/lib/path";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "猫猫图鉴 · 记录每一次相遇", template: "%s · 猫猫图鉴" },
  description: "认识社区里的每一只猫，记录照片、近况与温柔故事。",
  openGraph: { title: "猫猫图鉴", description: "记录每一次相遇", images: [asset("/archive/guide-2023-01.jpg")] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><Header/><main className="min-h-[calc(100vh-4rem)] pb-20 md:pb-0">{children}</main><BottomNav/><footer className="hidden border-t border-ink/8 py-10 md:block"><div className="mx-auto flex max-w-6xl justify-between px-6 text-sm text-ink/45"><p>猫猫图鉴 · 尊重距离，温柔记录</p><p>不公开猫咪精确位置</p></div></footer></body></html>;
}
