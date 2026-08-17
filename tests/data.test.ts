import { describe, expect, it } from "vitest";
import { cats, getCat, getCatTimeline } from "../lib/data";

describe("cat directory demo data", () => {
  it("uses unique ids and slugs", () => {
    expect(new Set(cats.map(c => c.id)).size).toBe(cats.length);
    expect(new Set(cats.map(c => c.slug)).size).toBe(cats.length);
  });
  it("resolves cat profiles and timeline", () => {
    expect(getCat("baga")?.name).toBe("八嘎");
    expect(getCatTimeline("baga").every(i => i.catSlug === "baga")).toBe(true);
  });
  it("marks temporary profiles clearly", () => {
    expect(cats.filter(c => c.status === "pending").length).toBeGreaterThan(0);
  });
});
