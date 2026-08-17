import { cats as fallbackCats, getCat as getFallbackCat } from "./data";
import type { Cat } from "./types";

const internalApi = process.env.CAT_API_INTERNAL_URL;

export async function getCats(): Promise<Cat[]> {
  if (!internalApi) return fallbackCats;
  try {
    const response = await fetch(`${internalApi}/cats/`, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    if (!response.ok) return fallbackCats;
    const data = await response.json() as { cats?: Cat[] };
    const remote = data.cats || [];
    const slugs = new Set(remote.map(cat => cat.slug));
    return [...remote, ...fallbackCats.filter(cat => !slugs.has(cat.slug))];
  } catch { return fallbackCats; }
}

export async function getCat(slug: string): Promise<Cat | undefined> {
  if (!internalApi) return getFallbackCat(slug);
  try {
    const response = await fetch(`${internalApi}/cats/${slug}/`, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    if (response.ok) return ((await response.json()) as { cat: Cat }).cat;
  } catch { /* fall back to bundled 2023 archive */ }
  return getFallbackCat(slug);
}
