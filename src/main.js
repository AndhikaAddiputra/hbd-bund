import { letter } from "./letter.js";
import { drawSky } from "./cosmos.js";
import { setupMusic } from "./music.js";

const canvas = document.querySelector("#langit");
const ctx = canvas.getContext("2d", { alpha: false });
const slides = [...document.querySelectorAll(".slide")];
const dialog = document.querySelector("#surat");
const article = dialog.querySelector("article");
const music = setupMusic(document.querySelector("#alunan"), document.querySelector("#sound-hint"));

article.querySelector("h2").textContent = letter.title;
const body = article.querySelector(".isi");
for (const paragraph of letter.paragraphs) {
  const p = document.createElement("p");
  p.textContent = paragraph;
  body.append(p);
}

let progress = 0;
let running = true;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, innerWidth < 800 ? 1.25 : 1.6);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  const mid = innerHeight * 0.46;
  for (const el of slides) {
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height * 0.42;
    const dist = Math.abs(center - mid) / innerHeight;
    const opacity = Math.max(0, Math.min(1, 1.2 - dist * 1.55));
    el.style.opacity = opacity.toFixed(3);
    const shift = Math.max(-16, Math.min(16, (center - mid) * 0.035));
    el.style.transform = `translateY(${shift.toFixed(1)}px)`;
  }
}

function frame(now) {
  if (!running) return;
  onScroll();
  drawSky(ctx, innerWidth, innerHeight, now / 1000, progress);
  requestAnimationFrame(frame);
}

document.querySelector("#buka-surat").addEventListener("click", () => {
  dialog.showModal();
  music.warm(true);
});

document.querySelector("#tutup-surat").addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", () => {
  music.warm(false);
});

addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", () => {
  resize();
  onScroll();
});

resize();
onScroll();
requestAnimationFrame(frame);
