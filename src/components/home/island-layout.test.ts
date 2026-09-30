import { describe, expect, it } from "vitest";
import { DESKTOP_ISLAND, islandFor, sameIsland } from "./island-layout";

describe("islandFor", () => {
  it("falls back to the desktop layout before the scene is measured", () => {
    expect(islandFor(0, 0)).toBe(DESKTOP_ISLAND);
  });

  it("keeps the sign beside the island on landscape screens", () => {
    const island = islandFor(1920, 1080);
    expect(island.stacked).toBe(false);
    expect(island.left + island.width / 2).toBeCloseTo(50);
  });

  it("switches to the two-line heading on mid-size desktops", () => {
    expect(islandFor(1280, 800).twoLine).toBe(true);
  });

  it("stacks the sign above the island on portrait screens", () => {
    const island = islandFor(390, 844);
    expect(island.stacked).toBe(true);
    expect(island.headingPx).toBeGreaterThan(0);
    expect(island.logoPx).toBeGreaterThan(0);
    expect(island.width).toBeLessThanOrEqual(96);
  });
});

describe("sameIsland", () => {
  it("ignores sub-pixel changes so resizes don't re-render needlessly", () => {
    const island = islandFor(1920, 1080);
    expect(sameIsland(island, { ...island, lift: island.lift + 0.1 })).toBe(true);
    expect(sameIsland(island, { ...island, stacked: !island.stacked })).toBe(false);
  });
});
