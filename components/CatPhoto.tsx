import Image from "next/image";
import { asset } from "@/lib/path";

export function CatPhoto({ src = "/community-cats.png", alt = "校园里的社区猫咪", position, priority = false, className = "" }: { src?: string; alt?: string; position: string; priority?: boolean; className?: string }) {
  if (/^https?:\/\//.test(src)) return <img src={src} alt={alt} className={`absolute inset-0 size-full object-cover ${className}`} style={{ objectPosition: position }} />;
  return <Image src={asset(src)} alt={alt} fill priority={priority} sizes="(max-width: 768px) 100vw, 33vw" className={`object-cover ${className}`} style={{ objectPosition: position }} />;
}
