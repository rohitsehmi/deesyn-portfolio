/**
 * A quiet field in the hero. A .ts, not a component: it must not move the
 * component count.
 *
 * The reference is a 20,000-point swarm. What belongs on a page someone is
 * reading is the quiet end of that: a few dozen slow specks, behind the
 * type, in the band's own foreground. A pointer parts them, and they ease
 * back once it leaves. It does not drag them into a shape.
 *
 * Reduced motion paints nothing. The headline is already the page.
 */

interface Speck {
  x: number;
  y: number;
  r: number;
  a: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  cool: boolean;
}

const REACH = 168;
const PUSH = 64;
/** How fast a speck eases toward the parting, and back. Per second. */
const RETURN = 10;

function parseColor(value: string): [number, number, number] | null {
  const v = value.trim();
  const hex = /^#([0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const fn = /rgba?\(([^)]+)\)/.exec(v);
  if (!fn) return null;
  const parts = fn[1].split(/[\s,/]+/).map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return [parts[0], parts[1], parts[2]];
}

export function bootHeroField(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('.home-field');
  if (!canvas || canvas.dataset.ready === 'true') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.dataset.ready = 'true';

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let specks: Speck[] = [];
  let ink: [number, number, number] | null = null;
  let cool: [number, number, number] | null = null;
  let pointerX = -9999;
  let pointerY = -9999;
  let pointing = false;
  let running = true;
  let frame = 0;
  let rafId = 0;

  const readColors = () => {
    const style = getComputedStyle(canvas);
    ink = parseColor(style.color);
    cool = parseColor(style.getPropertyValue('--field-cool'));
  };

  const seed = () => {
    /* A little denser than the last pass, still a scatter. The floor is what a
       phone actually hits; the cap is a wide desktop. */
    const count = Math.round(Math.min(56, Math.max(24, (width * height) / 23000)));
    specks = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 1.4,
      a: 0.14 + Math.random() * 0.22,
      vx: (Math.random() - 0.5) * 7,
      vy: -2 - Math.random() * 6,
      ox: 0,
      oy: 0,
      cool: Math.random() < 0.22,
    }));
  };

  const fit = () => {
    const box = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = box.width;
    height = box.height;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    readColors();
  };

  const start = () => {
    if (rafId || !running) return;
    frame = 0;
    rafId = requestAnimationFrame(draw);
  };

  const draw = (now: number) => {
    rafId = 0;
    if (!running) return;
    const dt = Math.min(0.05, frame ? (now - frame) / 1000 : 0.016);
    frame = now;
    ctx.clearRect(0, 0, width, height);
    for (const speck of specks) {
      speck.x += speck.vx * dt;
      speck.y += speck.vy * dt;
      if (speck.x < -8) speck.x = width + 8;
      if (speck.x > width + 8) speck.x = -8;
      if (speck.y < -8) speck.y = height + 8;
      if (speck.y > height + 8) speck.y = -8;

      let tx = 0;
      let ty = 0;
      if (pointing) {
        const dx = speck.x - pointerX;
        const dy = speck.y - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < REACH && dist > 0.01) {
          const push = (1 - dist / REACH) * PUSH;
          tx = (dx / dist) * push;
          ty = (dy / dist) * push;
        }
      }
      const settle = 1 - Math.exp(-RETURN * dt);
      speck.ox += (tx - speck.ox) * settle;
      speck.oy += (ty - speck.oy) * settle;
      const x = speck.x + speck.ox;
      const y = speck.y + speck.oy;

      const rgb = speck.cool && cool ? cool : ink;
      if (!rgb) continue;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${speck.a})`;
      ctx.arc(x, y, speck.r, 0, Math.PI * 2);
      ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  };

  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(canvas);

  const band = canvas.closest('.band');
  const seen = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting && document.visibilityState === 'visible';
    if (running) start();
  });
  if (band) seen.observe(band);

  document.addEventListener('visibilitychange', () => {
    const on = document.visibilityState === 'visible';
    if (on && !running && band) {
      const box = band.getBoundingClientRect();
      running = box.bottom > 0 && box.top < window.innerHeight;
      if (running) start();
    } else if (!on) {
      running = false;
    }
  });

  const theme = new MutationObserver(readColors);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);

  if (fine) {
    const track = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointerX = event.clientX - box.left;
      pointerY = event.clientY - box.top;
      pointing = pointerX >= 0 && pointerY >= 0 && pointerX <= box.width && pointerY <= box.height;
    };
    window.addEventListener('pointermove', track);
    window.addEventListener('pointerleave', () => {
      pointing = false;
    });
  }

  start();
}
