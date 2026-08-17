"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/path";

const CUTOUTS = [
  asset("/cats/cutouts/10dadd77be8bede0025c23dfa312ca4c__猫1.png"),
  asset("/cats/cutouts/41bf6bb0363aae5661c0fb1df4ee1cd3__猫2.png"),
  asset("/cats/cutouts/4b562fc862aa07f640041ec2de15d868__猫3.png"),
  asset("/cats/cutouts/5161b12af6d90121a9aa1175345293f0__猫4.png"),
  asset("/cats/cutouts/68c8e81ca9cbf4ec8efeb04bcb71cee7__猫5.png"),
  asset("/cats/cutouts/846f91ec1f30088c6db936e723394724__猫6.png"),
  asset("/cats/cutouts/8f5df08d8dad6bc2f57439845993414c__猫7.png"),
  asset("/cats/cutouts/9bdc8bc305581d3486035cab4ff51408__猫8.png"),
];

// 4 个轨道位置（围绕中心分布，保留原海报的错落感）
const SLOT_CLASSES = [
  "left-[1%] top-[1%] h-[46%] w-[52%] -rotate-3",
  "right-[1%] top-[6%] h-[40%] w-[42%] rotate-3",
  "bottom-[2%] left-[6%] h-[46%] w-[40%] rotate-2",
  "bottom-[4%] right-[1%] h-[44%] w-[46%] -rotate-2",
];

const SLOT_COUNT = 4;
const INTERVAL_MS = 6000; // 每隔 6 秒换一只
const FADE_MS = 1200;     // 淡入淡出时长

export function CatOrbit() {
  const [cats, setCats] = useState<number[]>([0, 1, 2, 3]);
  const [swap, setSwap] = useState<{ slot: number; from: number; to: number } | null>(null);
  const catsRef = useRef(cats);
  const swapRef = useRef(swap);
  const tickRef = useRef(0);
  catsRef.current = cats;
  swapRef.current = swap;

  useEffect(() => {
    const commitTimers: ReturnType<typeof setTimeout>[] = [];
    const id = setInterval(() => {
      // 上一次还没淡完就跳过，保证一次只换一只
      if (swapRef.current) return;
      const current = catsRef.current;
      const shown = new Set(current);
      const pool = CUTOUTS.map((_, i) => i).filter((i) => !shown.has(i));
      if (pool.length === 0) return;
      const to = pool[Math.floor(Math.random() * pool.length)];
      const slot = tickRef.current % SLOT_COUNT;
      tickRef.current += 1;
      setSwap({ slot, from: current[slot], to });
      const timer = setTimeout(() => {
        const next = [...catsRef.current];
        next[slot] = to;
        catsRef.current = next;
        setCats(next);
        setSwap(null);
      }, FADE_MS + 80);
      commitTimers.push(timer);
    }, INTERVAL_MS);
    return () => {
      clearInterval(id);
      commitTimers.forEach(clearTimeout);
    };
  }, []);

  const image = (index: number, fadeClass: string, priority: boolean, label: string) => (
    <Link href="/cats" aria-label={label} className={`absolute inset-0 ${fadeClass}`}>
      <div className="orbit-counter relative h-full w-full">
        <Image
          src={CUTOUTS[index]}
          alt={label}
          fill
          priority={priority}
          sizes="(max-width: 640px) 45vw, 25vw"
          className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]"
        />
      </div>
    </Link>
  );

  return (
    <div className="absolute inset-0 z-10">
      <div className="orbit-wrap absolute inset-0">
        {Array.from({ length: SLOT_COUNT }, (_, s) => {
          const swapping = swap && swap.slot === s;
          return (
            <div key={s} className={`absolute ${SLOT_CLASSES[s]}`}>
              {swapping ? (
                <>
                  {image(swap.from, "cat-fade-out", false, "猫咪")}
                  {image(swap.to, "cat-fade-in", true, "猫咪")}
                </>
              ) : (
                image(cats[s], "", true, "猫咪")
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
