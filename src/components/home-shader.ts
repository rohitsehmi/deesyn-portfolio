/**
 * A slow mesh on the surfaces that are already a field: the hero, and the
 * close. A .ts, not a component, so it does not move the component count.
 *
 * The stops are read off the element, which is how the same mesh stays on
 * the right side of the type. Inside the inverse hero those tokens flip
 * with the theme. The close sets its own, and they stay light, because the
 * type there is navy in both themes. Lime is not a hero stop: paper on it
 * fails.
 *
 * Reduced motion never starts it, and a browser without a GPU keeps the
 * flat ground that is already painted behind the canvas. Telemetry is off:
 * the page does not send its host anywhere.
 */

import type { ShaderInstance } from 'shaders/js';

const REDUCE = '(prefers-reduced-motion: reduce)';

interface Wash {
  canvas: HTMLCanvasElement;
  shader: ShaderInstance;
}

function cssColor(canvas: HTMLCanvasElement, name: string): string | null {
  const raw = getComputedStyle(canvas).getPropertyValue(name).trim();
  if (!raw) return null;
  const probe = document.createElement('span');
  probe.style.color = 'transparent';
  canvas.appendChild(probe);
  const blank = getComputedStyle(probe).color;
  probe.style.color = raw;
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  if (!resolved || resolved === blank) return null;
  const rgb = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(resolved);
  if (rgb) {
    const hex = rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
    return `#${hex}`;
  }
  const srgb = /color\(srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/.exec(resolved);
  if (!srgb) return null;
  const hex = srgb.slice(1, 4).map((n) => Math.round(Number(n) * 255).toString(16).padStart(2, '0')).join('');
  return `#${hex}`;
}

function stopsFor(canvas: HTMLCanvasElement) {
  const colors = ['--shader-a', '--shader-b', '--shader-c', '--shader-d'].map((name) => cssColor(canvas, name));
  if (colors.some((color) => color === null)) return null;
  const at = [0, 0.38, 0.7, 1];
  return colors.map((color, i) => ({ color: color as string, position: at[i] }));
}

export function bootHomeShader(): void {
  const canvases = [...document.querySelectorAll<HTMLCanvasElement>('canvas.home-shader')];
  if (!canvases.length) return;
  if (window.matchMedia(REDUCE).matches) return;
  if (canvases.some((canvas) => canvas.dataset.booted === 'true')) return;
  for (const canvas of canvases) canvas.dataset.booted = 'true';

  const pending: Wash[] = [];

  const paint = (wash: Wash) => {
    const stops = stopsFor(wash.canvas);
    if (!stops) return;
    wash.shader.update('wash', { stops, colorA: stops[0].color, colorB: stops[stops.length - 1].color });
  };

  const boot = async () => {
    const { createShader } = await import('shaders/js');
    for (const canvas of canvases) {
      const stops = stopsFor(canvas);
      if (!stops) continue;
      const held: { shader?: ShaderInstance } = {};
      try {
        const shader = await createShader(
          canvas,
          {
            components: [
              {
                type: 'MeshGradient',
                id: 'wash',
                props: {
                  stops,
                  colorA: stops[0].color,
                  colorB: stops[stops.length - 1].color,
                  colorSpace: 'oklab',
                  count: 4,
                  smoothness: 2.4,
                  variation: 0.22,
                  swirl: 0.2,
                  drift: 0.42,
                  wrapping: 0,
                  speed: 0.35,
                  seed: 4,
                },
              },
            ],
          },
          {
            disableTelemetry: true,
            colorSpace: 'srgb',
            onError: () => {
              if (held.shader?.getFailureReason()) canvas.dataset.failed = 'true';
            },
          },
        );
        held.shader = shader;
        if (shader.getFailureReason()) {
          canvas.dataset.failed = 'true';
          shader.destroy();
          continue;
        }
        canvas.dataset.live = 'true';
        pending.push({ canvas, shader });
      } catch {
        canvas.dataset.failed = 'true';
      }
    }
  };

  void boot();

  const refresh = () => {
    for (const wash of pending) paint(wash);
  };
  const reduce = window.matchMedia(REDUCE);
  reduce.addEventListener('change', () => {
    for (const wash of pending) {
      if (reduce.matches) wash.shader.pause();
      else wash.shader.resume();
    }
  });
  new MutationObserver(refresh).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
}
