const TAU = Math.PI * 2;

const tints = {
  gold: { core: [242, 224, 186], arm: [176, 190, 214] },
  blue: { core: [228, 236, 246], arm: [132, 164, 208] },
  pink: { core: [246, 220, 210], arm: [224, 156, 176] },
};

const specs = [
  { x: -0.02, y: 0.02, scale: 0.3, arms: 2, turns: 2.8, count: 720, tint: "gold", home: true, spin: 0.035 },
  { x: 0.86, y: -0.62, scale: 0.18, arms: 3, turns: 3.1, count: 480, tint: "blue", spin: -0.028 },
  { x: 0.78, y: 0.22, scale: 0.15, arms: 2, turns: 2.4, count: 340, tint: "gold", spin: 0.04 },
  { x: -0.7, y: 0.36, scale: 0.18, arms: 2, turns: 2.6, count: 420, tint: "blue", spin: -0.022 },
  { x: 0.18, y: 0.52, scale: 0.17, arms: 2, turns: 2.2, count: 300, tint: "pink", kind: "cloud", spin: 0.02 },
  { x: -0.46, y: -0.46, scale: 0.13, arms: 2, turns: 2.5, count: 280, tint: "blue", spin: 0.03 },
  { x: 0.38, y: -0.66, scale: 0.11, arms: 2, turns: 2.2, count: 220, tint: "gold", spin: -0.026 },
  { x: -0.82, y: -0.12, scale: 0.12, arms: 2, turns: 2.4, count: 240, tint: "pink", kind: "cloud", spin: 0.018 },
  { x: 0.9, y: -0.58, scale: 0.09, arms: 2, turns: 2, count: 160, tint: "blue", spin: 0.04 },
  { x: -0.22, y: 0.78, scale: 0.1, arms: 2, turns: 2.3, count: 180, tint: "gold", spin: -0.02 },
  { x: 0.08, y: -0.82, scale: 0.08, arms: 2, turns: 2, count: 140, tint: "blue", spin: 0.025 },
  { x: 0.5, y: 0.7, scale: 0.14, arms: 2, turns: 3, count: 260, tint: "pink", spin: -0.03 },
  { x: -0.58, y: 0.72, scale: 0.07, arms: 2, turns: 2, count: 120, tint: "gold", spin: 0.02 },
  { x: 0.28, y: 0.18, scale: 0.08, arms: 2, turns: 2.2, count: 140, tint: "blue", spin: 0.015 },
];

function rand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGalaxy(spec, rng) {
  const tint = tints[spec.tint];
  const pts = [];
  const count = spec.count;
  for (let i = 0; i < count; i++) {
    const arm = i % spec.arms;
    const u = Math.pow(rng(), 0.72);
    let x;
    let y;
    if (spec.kind === "cloud") {
      const a = rng() * TAU;
      const r = Math.pow(rng(), 0.55) * spec.scale;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r * 0.82;
    } else {
      const theta = u * Math.PI * spec.turns + (arm / spec.arms) * TAU;
      const r = u * spec.scale;
      const jitter = (rng() - 0.5) * spec.scale * (0.04 + u * 0.09);
      x = Math.cos(theta) * (r + jitter);
      y = Math.sin(theta) * (r + jitter) * 0.7;
    }
    const core = u < 0.18 ? 1 - u / 0.18 : 0;
    const cr = tint.core[0] * core + tint.arm[0] * (1 - core);
    const cg = tint.core[1] * core + tint.arm[1] * (1 - core);
    const cb = tint.core[2] * core + tint.arm[2] * (1 - core);
    pts.push({
      x,
      y,
      s: (core ? 1.7 : 0.7) + rng() * (core ? 1.5 : 1.1),
      a: (core ? 0.75 : 0.28) + rng() * 0.4,
      c: `rgba(${cr | 0},${cg | 0},${cb | 0},`,
    });
  }
  return pts;
}

function buildStars(count, rng) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rng(),
      y: rng(),
      s: rng() < 0.08 ? 1.8 : 0.6 + rng() * 0.8,
      p: rng() * TAU,
      v: 0.6 + rng() * 1.8,
      a: 0.25 + rng() * 0.75,
    });
  }
  return stars;
}

function makeCanvas(size) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(size, size);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function paintGalaxy(spec, pts) {
  const size = 420;
  const worldRadius = spec.scale * 1.28;
  const canvas = makeCanvas(size);
  const g = canvas.getContext("2d");
  const mid = size / 2;
  const map = mid / worldRadius;
  const glow = g.createRadialGradient(mid, mid, 0, mid, mid, size * 0.16);
  const core = tints[spec.tint].core;
  glow.addColorStop(0, `rgba(${core[0]},${core[1]},${core[2]},0.55)`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    g.fillStyle = `${p.c}${p.a.toFixed(3)})`;
    g.beginPath();
    g.arc(mid + p.x * map, mid + p.y * map, Math.max(0.6, p.s * 0.72), 0, TAU);
    g.fill();
  }
  return { canvas, worldRadius };
}

const rng = rand(19711030);
const galaxies = specs.map((spec) => {
  const pts = buildGalaxy(spec, rng);
  return {
    ...spec,
    rot: rng() * TAU,
    ...paintGalaxy(spec, pts),
  };
});
const stars = buildStars(640, rng);
const home = galaxies.find((g) => g.home);

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const sawangan = new Image();
sawangan.src = "assets/sawangan.jpg";

function drawEarth(ctx, w, h, alpha, cx, cy, R) {
  if (alpha <= 0.01) return;
  cx = cx ?? w * 0.5;
  cy = cy ?? h * 0.74;
  R = R ?? Math.min(w, h) * 0.1;

  const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 3.2);
  glow.addColorStop(0, `rgba(232, 196, 150, ${0.28 * alpha})`);
  glow.addColorStop(0.35, `rgba(90, 120, 170, ${0.12 * alpha})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
  body.addColorStop(0, `rgba(236, 228, 210, ${alpha})`);
  body.addColorStop(0.42, `rgba(118, 164, 196, ${alpha})`);
  body.addColorStop(1, `rgba(36, 64, 104, ${alpha})`);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.08, 0, TAU);
  ctx.strokeStyle = `rgba(190, 216, 232, ${0.35 * alpha})`;
  ctx.lineWidth = Math.max(2, R * 0.07);
  ctx.stroke();
}

function drawFocused(ctx, img, w, h, ax, ay, zoom) {
  const ir = img.width / img.height;
  const sr = w / h;
  let dw;
  let dh;
  if (ir > sr) {
    dh = h * zoom;
    dw = dh * ir;
  } else {
    dw = w * zoom;
    dh = dw / ir;
  }
  const cover = Math.max((Math.max(ax, w - ax) * 2) / dw, (Math.max(ay, h - ay) * 2) / dh, 1);
  dw *= cover;
  dh *= cover;
  ctx.drawImage(img, ax - dw / 2, ay - dh / 2, dw, dh);
}

function drawPin(ctx, x, y, alpha) {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, TAU);
  ctx.strokeStyle = "rgba(255, 246, 236, 0.85)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 5.5, 0, TAU);
  ctx.fillStyle = "#fff6ec";
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff8f2";
  ctx.font = "600 30px Newsreader, Georgia, serif";
  ctx.fillText("Sawangan", x, y + 46);
  ctx.font = "400 13px Outfit, sans-serif";
  ctx.fillStyle = "rgba(255, 246, 236, 0.86)";
  ctx.fillText("Indonesia", x, y + 68);
  ctx.restore();
}

function drawLanding(ctx, w, h, progress) {
  const arrive = smoothstep(0.58, 0.76, progress);
  if (arrive <= 0.01) return;
  const descend = smoothstep(0.74, 1, progress);
  const ax = w * 0.5;
  const ay = h * 0.74;
  const earthR = Math.min(w, h) * (0.07 + arrive * 0.08);
  drawEarth(ctx, w, h, (1 - descend) * arrive, ax, ay, earthR);

  if (!sawangan.complete || !sawangan.naturalWidth || descend <= 0.01) return;

  const far = Math.hypot(Math.max(ax, w - ax), Math.max(ay, h - ay)) * 1.05;
  const clipR = earthR + (far - earthR) * descend;
  ctx.save();
  ctx.beginPath();
  ctx.arc(ax, ay, clipR, 0, TAU);
  ctx.clip();
  drawFocused(ctx, sawangan, w, h, ax, ay, 1.08 + descend * 0.28);
  const veil = ctx.createLinearGradient(0, 0, 0, h);
  veil.addColorStop(0, "rgba(7, 6, 13, 0.62)");
  veil.addColorStop(0.38, "rgba(7, 6, 13, 0.18)");
  veil.addColorStop(1, "rgba(7, 6, 13, 0.28)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  drawPin(ctx, ax, ay, smoothstep(0.45, 0.85, descend));

  if (descend > 0.55) {
    ctx.save();
    ctx.globalAlpha = (descend - 0.55) / 0.45;
    ctx.font = "400 11px Outfit, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.textAlign = "right";
    ctx.fillText("Citra: Esri, Maxar", w - 16, h - 22);
    ctx.restore();
  }
}

export function drawSky(ctx, width, height, time, progress) {
  ctx.fillStyle = "#07060d";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const tw = 0.55 + 0.45 * Math.sin(time * s.v + s.p);
    const fade = 1 - smoothstep(0.62, 0.9, progress);
    ctx.fillStyle = `rgba(236, 234, 228, ${s.a * tw * fade})`;
    ctx.fillRect(s.x * width, s.y * height, s.s, s.s);
  }

  const zoom = 1 + Math.pow(progress, 1.25) * 8;
  const focus = smoothstep(0.05, 0.72, progress);
  const fx = home.x * focus;
  const fy = home.y * focus;
  const unit = Math.min(width, height) * 0.52;
  const cx = width / 2;
  const cy = height / 2;
  const farFade = smoothstep(0.48, 0.74, progress);
  const homeFade = smoothstep(0.62, 0.82, progress);

  for (let g = 0; g < galaxies.length; g++) {
    const gal = galaxies[g];
    const alpha = gal.home ? 1 - homeFade * 0.85 : 1 - farFade;
    if (alpha <= 0.02) continue;
    const gx = cx + (gal.x - fx) * unit * zoom;
    const gy = cy + (gal.y - fy) * unit * zoom;
    const drawW = gal.worldRadius * 2 * unit * zoom;
    if (gx < -drawW || gy < -drawW || gx > width + drawW || gy > height + drawW) continue;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(gal.rot + time * gal.spin);
    ctx.globalAlpha = alpha;
    ctx.drawImage(gal.canvas, -drawW / 2, -drawW / 2, drawW, drawW);
    ctx.restore();
  }

  drawLanding(ctx, width, height, progress);
}
