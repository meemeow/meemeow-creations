import { GATEWAYS_LEFT } from "./EndGateways";
import { STEVE_VIEWBOX } from "./Steve";

export const BLOCK = 100 / 17;
const STEVE_PX = (1.8 * BLOCK) / 32;
export const SPRITE_W = STEVE_VIEWBOX.w * STEVE_PX;
export const LAND_AT = 0.8 * BLOCK;
const SHIFT_LEFT = 0.6 * BLOCK;
export const STAND_AT = 2.6 * BLOCK - SHIFT_LEFT;
export const SIGN_LEFT = 9 - SHIFT_LEFT;
export const SIGN_LIFT = 0.9 * BLOCK;
export const HEADING_END = GATEWAYS_LEFT - 0.35 * BLOCK;
export const TWO_LINE_LIFT = 2.2 * BLOCK;
export const TWO_LINE_SHIFT = 5;
export const HEADING_DROP = 0.125;
export const SIGN_GAP = 1.4;

const STACK_BELOW = 1.3;
const FILL = 0.68;
const SCENE_BLOCKS = 7.25;
const STACK_GAP = 1;
const GATEWAY_TOP = 4.75;
const STACK_MAX_H = 0.98;
const TWO_LINE_FROM = 866;
const TWO_LINE_TO = 1535;

export type IslandBox = {
  left: number;
  width: number;
  lift: number;
  stacked: boolean;
  twoLine: boolean;
  headingPx: number;
  logoPx: number;
  signGapPx: number;
};

export const DESKTOP_ISLAND: IslandBox = {
  left: 15.32,
  width: 69.36,
  lift: 0,
  stacked: false,
  twoLine: false,
  headingPx: 0,
  logoPx: 0,
  signGapPx: 0,
};

export function islandFor(w: number, h: number): IslandBox {
  if (!w || !h) return DESKTOP_ISLAND;
  const aspect = w / h;
  let width = Math.min(96, Math.max(30, ((FILL * h * 17) / SCENE_BLOCKS / w) * 100));
  if (aspect < STACK_BELOW) width = Math.min(width, ((STACK_MAX_H * h) / w) * 100);
  const left = (100 - width) / 2;
  const islandPx = (width / 100) * w;
  const block = islandPx / 17;
  if (aspect >= STACK_BELOW) {
    const lift = Math.max(0, Math.min(1.5 * block, (FILL * h - SCENE_BLOCKS * block) / 2));
    const screenEdge = (left / width) * 100 + SIGN_LEFT;
    const room = (islandPx * (HEADING_END + screenEdge)) / 100 - 16;
    const twoLine = (w >= TWO_LINE_FROM && w <= TWO_LINE_TO) || 22.5 * 0.02944 * islandPx > room;
    return { ...DESKTOP_ISLAND, left, width, lift, twoLine };
  }

  const signH = () => headingPx * (1 + SIGN_GAP) + logoPx / 3;
  const islandTop = Math.min(h * 0.74, h - 2.5 * block);
  const lift = Math.max(0, h - islandTop - 2.5 * block);
  const skyBottom = islandTop - (GATEWAY_TOP + STACK_GAP) * block;
  const margin = Math.max(40, h * 0.07);
  const room = skyBottom - margin;
  const grow = Math.min(1.4, Math.max(1, room / 300));
  const tablet = w < TWO_LINE_FROM;
  const k0 = tablet ? 0.8 : 1;
  let headingPx = k0 * Math.min((islandPx * 0.88 * grow) / 21, (islandPx * 0.92) / 21, 38);
  let logoPx = k0 * Math.min(islandPx * 0.42 * grow, islandPx * 0.62, 320);
  if (signH() > room * 0.8) {
    const k = Math.max(0.4, (room * 0.8) / signH());
    headingPx *= k;
    logoPx *= k;
  }
  const signBottom = Math.min(skyBottom, margin + room * (tablet ? 0.72 : 0.6) + signH() / 2);
  return { left, width, lift, stacked: true, twoLine: false, headingPx, logoPx, signGapPx: islandTop - signBottom };
}

export const sameIsland = (a: IslandBox, b: IslandBox) =>
  Math.abs(a.width - b.width) < 0.01 &&
  Math.abs(a.lift - b.lift) < 0.5 &&
  a.stacked === b.stacked &&
  a.twoLine === b.twoLine &&
  Math.abs(a.signGapPx - b.signGapPx) < 0.5 &&
  Math.abs(a.headingPx - b.headingPx) < 0.1;

export const leftFor = (centre: number) => `${centre - SPRITE_W / 2}%`;
