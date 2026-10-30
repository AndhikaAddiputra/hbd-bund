const audio = new Audio("assets/alunan.wav");
audio.loop = true;
audio.preload = "auto";
audio.volume = 0.7;

let wanted = true;
let started = false;

function paint(button, hint) {
  const on = started && wanted && !audio.paused;
  button.setAttribute("aria-pressed", String(on));
  button.textContent = !started ? "Alunan" : on ? "Alunan menyala" : "Alunan mati";
  hint.hidden = started;
}

export function setupMusic(button, hint) {
  async function start() {
    if (!wanted || started) return;
    try {
      await audio.play();
      started = true;
      paint(button, hint);
    } catch {
      paint(button, hint);
    }
  }

  addEventListener("pointerdown", (event) => {
    if (event.target.closest("#alunan")) return;
    start();
  });

  button.addEventListener("click", async () => {
    if (!started) {
      wanted = true;
      await start();
      return;
    }
    wanted = !wanted;
    if (wanted) await audio.play();
    else audio.pause();
    paint(button, hint);
  });

  document.addEventListener("visibilitychange", () => {
    if (!started || !wanted) return;
    if (document.hidden) audio.pause();
    else audio.play();
  });

  paint(button, hint);

  return {
    warm(on) {
      audio.volume = on ? 0.84 : 0.7;
    },
  };
}
