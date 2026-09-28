import * as THREE from "three";
import { BEDROCK, BEDROCK_PALETTE } from "./EndGateways";
import { FACE, PALETTE } from "./EndIsland";

// Steve's point of view for the ender pearl mini-game, in real 3D (three.js): standing on the End
// island's end stone, looking out at the three End gateways (bedrock around a portal block, a
// magenta beam through each) floating ahead in the dark purple End sky, with a few far islands.
// Blocky Minecraft look: 1 unit = 1 block, 16x16 textures with hard pixels, flat side shading.

type RGB = [number, number, number];

const SKY = 0x150e1f;
const EYE = new THREE.Vector3(0, 1.62, 3); // his eyes, standing on the island
const START = new THREE.Vector3(-3.5, 3.2, 7.5); // the view drops in from behind him
// Portal centres: About (left), Projects (middle, a little further off), Contact (right).
const PORTALS = [new THREE.Vector3(-4.3, 4, -5.5), new THREE.Vector3(0, 4.3, -7.5), new THREE.Vector3(4.3, 4, -5.5)];
// Bedrock around each portal: a plus shape a block above and below it, and one more beyond each.
const GATEWAY_BLOCKS: [number, number, number][] = [
  [0, 2, 0],
  [0, 1, 0], [1, 1, 0], [-1, 1, 0], [0, 1, 1], [0, 1, -1],
  [0, -1, 0], [1, -1, 0], [-1, -1, 0], [0, -1, 1], [0, -1, -1],
  [0, -2, 0],
];

function texture(rows: string[], palette: Record<string, RGB>) {
  const c = document.createElement("canvas");
  c.width = c.height = 16;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(16, 16);
  rows.forEach((row, y) => [...row].forEach((k, x) => img.data.set([...palette[k], 255], (y * 16 + x) * 4)));
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Minecraft's flat side shading: tops full bright, sides and bottoms darker.
function shadedBox() {
  const g = new THREE.BoxGeometry(1, 1, 1);
  const shade = [0.6, 0.6, 1, 0.5, 0.8, 0.8]; // +x, -x, +y, -y, +z, -z
  const colours: number[] = [];
  for (let face = 0; face < 6; face++) for (let v = 0; v < 4; v++) colours.push(shade[face], shade[face], shade[face]);
  g.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
  return g;
}

// The End island underfoot and a few distant ones: blocks inside a rough ellipse, the layers below
// narrowing like an island's underside.
function islandBlocks(cx: number, cz: number, rx: number, rz: number, top: number, depth: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const out: [number, number, number][] = [];
  for (let layer = 0; layer < depth; layer++) {
    const shrink = 1 - layer / depth;
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
      for (let z = Math.floor(cz - rz); z <= cz + rz; z++) {
        const d = ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2;
        if (d < shrink * shrink * (0.85 + rand() * 0.25)) out.push([x, top - layer, z]);
      }
  }
  return out;
}

export type PovScene = ReturnType<typeof createPovScene>;

export function createPovScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 26, 70);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 200);

  const box = shadedBox();
  const disposables: { dispose: () => void }[] = [box];

  // The pixel specks from the home page's background, fixed in the sky all around: white and
  // grey square dots, a few a little bigger.
  const dpr = renderer.getPixelRatio();
  for (const [count, size] of [
    [1600, 2],
    [260, 3.5],
  ]) {
    const positions: number[] = [];
    const colours: number[] = [];
    for (let i = 0; i < count; i++) {
      // an even spread over a big sphere (mostly above the horizon, where the sky shows)
      const y = Math.random() * 1.2 - 0.25;
      const r = Math.sqrt(Math.max(0, 1 - Math.min(1, y * y)));
      const a = Math.random() * Math.PI * 2;
      positions.push(Math.cos(a) * r * 150, y * 150, Math.sin(a) * r * 150);
      const shade = [1, 0.77, 0.5, 0.3][Math.floor(Math.random() * 4)];
      colours.push(shade, shade, shade);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
    const mat = new THREE.PointsMaterial({ size: size * dpr, sizeAttenuation: false, vertexColors: true, fog: false });
    scene.add(new THREE.Points(geo, mat));
    disposables.push(geo, mat);
  }

  // End stone: one instanced mesh for every block.
  const endStone = texture(FACE, PALETTE);
  const stoneMat = new THREE.MeshBasicMaterial({ map: endStone, vertexColors: true });
  const blocks = [
    ...islandBlocks(0, -6, 13, 14, -0.5, 4, 3),
    ...islandBlocks(-30, -38, 5, 4, -7.5, 3, 5),
    ...islandBlocks(27, -34, 6, 5, -4.5, 3, 7),
    ...islandBlocks(12, -60, 8, 5, -12.5, 3, 9),
  ];
  const island = new THREE.InstancedMesh(box, stoneMat, blocks.length);
  const m = new THREE.Matrix4();
  blocks.forEach(([x, y, z], i) => island.setMatrixAt(i, m.makeTranslation(x, y, z)));
  scene.add(island);
  disposables.push(endStone, stoneMat, island);

  // The gateways.
  const bedrock = texture(BEDROCK, BEDROCK_PALETTE);
  const bedrockMat = new THREE.MeshBasicMaterial({ map: bedrock, vertexColors: true });
  const gate = new THREE.InstancedMesh(box, bedrockMat, GATEWAY_BLOCKS.length * PORTALS.length);
  PORTALS.forEach((p, g) =>
    GATEWAY_BLOCKS.forEach(([x, y, z], i) => gate.setMatrixAt(g * GATEWAY_BLOCKS.length + i, m.makeTranslation(p.x + x, p.y + y, p.z + z))),
  );
  scene.add(gate);
  disposables.push(bedrock, bedrockMat, gate);

  // The portal blocks: a drifting starfield of teal and lavender specks on blue-black.
  const starCanvas = document.createElement("canvas");
  starCanvas.width = starCanvas.height = 32;
  const starCtx = starCanvas.getContext("2d")!;
  const specks = Array.from({ length: 34 }, () => ({
    x: Math.random() * 32,
    y: Math.random() * 32,
    v: 0.6 + Math.random() * 1.4,
    c: ["#2c6b80", "#3aa8a0", "#78d8cc", "#6a74a6", "#4a8cc0"][Math.floor(Math.random() * 5)],
  }));
  const stars = new THREE.CanvasTexture(starCanvas);
  stars.magFilter = stars.minFilter = THREE.NearestFilter;
  stars.generateMipmaps = false;
  stars.colorSpace = THREE.SRGBColorSpace;
  const drawStars = (dt: number) => {
    starCtx.fillStyle = "#070b16";
    starCtx.fillRect(0, 0, 32, 32);
    for (const s of specks) {
      s.x = (s.x + s.v * dt * 1.5) % 32;
      s.y = (s.y + s.v * dt * 0.8) % 32;
      starCtx.fillStyle = s.c;
      starCtx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
    }
    stars.needsUpdate = true;
  };
  drawStars(0);
  const portalMat = new THREE.MeshBasicMaterial({ map: stars });
  const portals = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), portalMat, PORTALS.length);
  PORTALS.forEach((p, i) => portals.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)));
  scene.add(portals);
  disposables.push(stars, portalMat, portals, portals.geometry);

  // The beams: a bright core and a soft glow, up into the sky and down onto the island.
  const beamCore = new THREE.MeshBasicMaterial({ color: 0xe592f2, fog: false });
  const beamGlow = new THREE.MeshBasicMaterial({
    color: 0xb84ad8,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  disposables.push(beamCore, beamGlow);
  for (const p of PORTALS) {
    for (const [from, to] of [
      [p.y + 2.5, p.y + 120],
      [0, p.y - 2.5],
    ]) {
      const h = to - from;
      const core = new THREE.Mesh(new THREE.BoxGeometry(0.22, h, 0.22), beamCore);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.7, h, 0.7), beamGlow);
      core.position.set(p.x, from + h / 2, p.z);
      glow.position.copy(core.position);
      scene.add(core, glow);
      disposables.push(core.geometry, glow.geometry);
    }
  }

  // The thrown pearl and the flare where it lands.
  const pearlTex = new THREE.TextureLoader().load("/assets/images/ender-pearl.png");
  pearlTex.magFilter = pearlTex.minFilter = THREE.NearestFilter;
  pearlTex.generateMipmaps = false;
  pearlTex.colorSpace = THREE.SRGBColorSpace;
  const pearlMat = new THREE.SpriteMaterial({ map: pearlTex, transparent: true });
  const pearl = new THREE.Sprite(pearlMat);
  pearl.scale.setScalar(0.32);
  pearl.visible = false;
  scene.add(pearl);
  const flareCanvas = document.createElement("canvas");
  flareCanvas.width = flareCanvas.height = 64;
  const fctx = flareCanvas.getContext("2d")!;
  const grad = fctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(229,146,242,0.9)");
  grad.addColorStop(1, "rgba(170,60,210,0)");
  fctx.fillStyle = grad;
  fctx.fillRect(0, 0, 64, 64);
  const flareTex = new THREE.CanvasTexture(flareCanvas);
  const flareMat = new THREE.SpriteMaterial({ map: flareTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const flare = new THREE.Sprite(flareMat);
  flare.visible = false;
  scene.add(flare);
  disposables.push(pearlTex, pearlMat, flareTex, flareMat);

  // Where he looks: straight at the middle gateway, turned a little toward the pointer.
  const lookBase = new THREE.Vector3(0, 3.4, -7);
  const aim = { x: 0, y: 0 }; // pointer, -1..1
  const look = { x: 0, y: 0 }; // eased
  let entering: { from: number; ms: number } | null = null;
  let throwing: { from: THREE.Vector3; to: THREE.Vector3; start: number; ms: number; done: () => void } | null = null;
  let flaring: { start: number; ms: number } | null = null;
  let raf = 0;
  let last = performance.now();
  let starClock = 0;

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // 70deg tall on wide screens; on narrow ones (phones held upright) widen it so the view still
    // takes in all three gateways side by side
    const wide = (2 * Math.atan(Math.tan((70 * Math.PI) / 360) * Math.max(1, 1.6 / camera.aspect)) * 180) / Math.PI;
    camera.fov = Math.min(105, wide);
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Dropping into his eyes, then free looking.
    const k = entering ? ease(Math.min(1, (now - entering.from) / entering.ms)) : 1;
    camera.position.lerpVectors(START, EYE, k);
    look.x += (aim.x - look.x) * Math.min(1, dt * 6);
    look.y += (aim.y - look.y) * Math.min(1, dt * 6);
    const target = lookBase.clone().add(new THREE.Vector3(look.x * 1.8 * k, look.y * 1 * k, 0));
    camera.lookAt(target);

    starClock += dt;
    if (starClock > 0.09) {
      drawStars(starClock);
      starClock = 0;
    }

    if (throwing) {
      const t = Math.min(1, (now - throwing.start) / throwing.ms);
      pearl.visible = true;
      pearl.position.lerpVectors(throwing.from, throwing.to, t);
      pearl.position.y += Math.sin(t * Math.PI) * 1.6; // an arc
      pearl.material.rotation = t * 10;
      if (t >= 1) {
        pearl.visible = false;
        const done = throwing.done;
        flare.position.copy(throwing.to);
        throwing = null;
        flaring = { start: now, ms: 320 };
        done();
      }
    }
    if (flaring) {
      const t = Math.min(1, (now - flaring.start) / flaring.ms);
      flare.visible = true;
      flare.scale.setScalar(1 + t * 5);
      flareMat.opacity = t < 0.4 ? t / 0.4 : 1;
      if (t >= 1) flaring = null;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  return {
    // Start drawing, dropping the view into his eyes over `ms`.
    enter(ms: number) {
      entering = { from: performance.now(), ms: Math.max(1, ms) };
      look.x = aim.x;
      look.y = aim.y;
      flare.visible = false;
      pearl.visible = false;
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    // The pointer, relative to the canvas (-1..1 each way, y up).
    setAim(x: number, y: number) {
      aim.x = Math.max(-1, Math.min(1, x));
      aim.y = Math.max(-1, Math.min(1, y));
    },
    // Each portal's centre on screen, in CSS px from the canvas's top left, with its apparent size.
    portalsOnScreen() {
      const { width, height } = canvas.getBoundingClientRect();
      return PORTALS.map((p) => {
        const c = p.clone().project(camera);
        const edge = p.clone().add(new THREE.Vector3(0.5, 0, 0)).project(camera);
        const top = p.clone().add(new THREE.Vector3(0, 2.6, 0)).project(camera); // above the gateway
        return {
          x: ((c.x + 1) / 2) * width,
          y: ((1 - c.y) / 2) * height,
          size: Math.abs(edge.x - c.x) * width,
          top: ((1 - top.y) / 2) * height,
        };
      });
    },
    // Throw from the hand (bottom right of the view) to portal `i`; `done` once it's there.
    throwTo(i: number, ms: number, done: () => void) {
      const towards = new THREE.Vector3(0.55, -0.45, 0.5).unproject(camera).sub(camera.position).normalize();
      const hand = camera.position.clone().addScaledVector(towards, 0.9);
      throwing = { from: hand, to: PORTALS[i].clone(), start: performance.now(), ms, done };
    },
    destroy() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
