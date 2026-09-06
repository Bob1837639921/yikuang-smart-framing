import { useEffect, useRef } from "react";

type InkDab = {
  x: number;
  y: number;
  radius: number;
  angle: number;
  stretch: number;
  bornAt: number;
  lifetime: number;
  opacity: number;
};

const MAX_DABS = 90;
const MAX_PIXELS = 1_000_000;

export default function InkCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dabs: InkDab[] = [];
    let lastPoint: { x: number; y: number; time: number } | null = null;
    let animationFrame = 0;
    let strokeLength = 0;
    let smoothRadius = 3;
    let smoothSpeed = 0;
    let pixelRatio = 1;
    let pendingPointer: PointerEvent | null = null;
    let dirty: { x: number; y: number; width: number; height: number } | null = null;
    // Bake the wash once. Drawing a small bitmap avoids rebuilding hundreds of
    // radial gradients during every frame of a stroke.
    const stamp = document.createElement("canvas");
    stamp.width = stamp.height = 64;
    const brush = stamp.getContext("2d");
    if (!brush) return;
    // Build a dry-brush core and irregular capillary edge once, not per frame.
    const pixels = brush.createImageData(64, 64);
    let seed = 731;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const bristles = Array.from({ length: 64 }, () => random());
    for (let y = 0; y < 64; y += 1) {
      for (let x = 0; x < 64; x += 1) {
        const nx = (x - 31.5) / 30, ny = (y - 31.5) / 30;
        const edge = Math.sqrt(nx * nx + ny * ny);
        const grain = random();
        const boundary = 0.92 + Math.sin(Math.atan2(ny, nx) * 11) * 0.035;
        const wash = Math.max(0, 1 - edge / boundary);
        const core = Math.min(1, wash * 5);
        // Longitudinal gaps follow the travelling brush direction.
        const dry = bristles[y] < 0.2 ? 0.2 : 0.75 + grain * 0.25;
        const alpha = core * dry * (grain < 0.07 ? 0.25 : 1);
        const i = (y * 64 + x) * 4;
        pixels.data[i] = 28; pixels.data[i + 1] = 29; pixels.data[i + 2] = 26;
        pixels.data[i + 3] = Math.round(alpha * 255);
      }
    }
    brush.putImageData(pixels, 0, 0);

    const resize = () => {
      clearStroke();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(MAX_PIXELS / (window.innerWidth * window.innerHeight)));
      canvas.width = Math.max(1, Math.round(window.innerWidth * pixelRatio));
      canvas.height = Math.max(1, Math.round(window.innerHeight * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const render = (now: number) => {
      animationFrame = 0;
      if (pendingPointer) {
        const event = pendingPointer;
        pendingPointer = null;
        addStroke(event);
      }
      if (dirty) {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        const x = Math.floor(dirty.x * pixelRatio), y = Math.floor(dirty.y * pixelRatio);
        context.clearRect(x, y, Math.ceil((dirty.x + dirty.width) * pixelRatio) - x, Math.ceil((dirty.y + dirty.height) * pixelRatio) - y);
        context.restore();
      }
      let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
      for (let index = dabs.length - 1; index >= 0; index -= 1) {
        const dab = dabs[index];
        const progress = Math.max(0, (now - dab.bornAt) / dab.lifetime);
        if (progress >= 1) {
          dabs.splice(index, 1);
          continue;
        }
        const fade = Math.pow(1 - progress, 1.35);
        const radius = dab.radius * (1 + progress * 0.14);
        // Rotated bitmap corners extend beyond the ellipse radius. Include the
        // full transformed square, then clear on integer backing-store pixels.
        const extent = radius * Math.hypot(dab.stretch, 1) + 3 / pixelRatio;
        left = Math.min(left, dab.x - extent);
        top = Math.min(top, dab.y - extent);
        right = Math.max(right, dab.x + extent);
        bottom = Math.max(bottom, dab.y + extent);
        context.save();
        context.translate(dab.x, dab.y);
        context.rotate(dab.angle);
        context.scale(dab.stretch, 1);
        context.globalAlpha = dab.opacity * fade;
        context.drawImage(stamp, -radius, -radius, radius * 2, radius * 2);
        context.restore();
      }
      dirty = left < Infinity ? { x: left, y: top, width: right - left, height: bottom - top } : null;
      if (dabs.length || pendingPointer) animationFrame = window.requestAnimationFrame(render);
    };

    const wakeRenderer = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(render);
    };

    const clearStroke = () => {
      dabs.length = 0;
      pendingPointer = null;
      dirty = null;
      lastPoint = null;
      strokeLength = 0; smoothRadius = 3; smoothSpeed = 0;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    };

    const addStroke = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const hoveredElement = event.target instanceof Element ? event.target : null;
      if (hoveredElement?.closest(".home-gallery-corridor, button, a, input, select, textarea, [role=tab]")) {
        clearStroke();
        return;
      }
      const now = performance.now();
      if (!lastPoint || now - lastPoint.time > 100 || Math.hypot(event.clientX - lastPoint.x, event.clientY - lastPoint.y) > 180) {
        lastPoint = { x: event.clientX, y: event.clientY, time: now };
        strokeLength = 0; smoothRadius = 3; smoothSpeed = 0;
        return;
      }
      const dx = event.clientX - lastPoint.x;
      const dy = event.clientY - lastPoint.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) return;
      const elapsed = Math.max(8, now - lastPoint.time);
      const speed = distance / elapsed;
      const angle = Math.atan2(dy, dx);
      smoothSpeed += (speed - smoothSpeed) * 0.3;
      const targetRadius = Math.max(2, Math.min(9, 9 / (1 + smoothSpeed * 1.6)));
      const previousRadius = smoothRadius;
      smoothRadius += (targetRadius - smoothRadius) * 0.35;
      const steps = Math.min(24, Math.max(1, Math.ceil(distance / 3)));
      for (let step = 1; step <= steps; step += 1) {
        const ratio = step / steps;
        const x = lastPoint.x + dx * ratio;
        const y = lastPoint.y + dy * ratio;
        const travelled = strokeLength + distance * ratio;
        const attack = Math.min(1, 0.3 + travelled / 35);
        const brushRadius = (previousRadius + (smoothRadius - previousRadius) * ratio) * attack;
        const pressureWave = 0.94 + Math.sin(travelled * 0.08) * 0.06;
        dabs.push({ x, y, radius: brushRadius * pressureWave, angle, stretch: 1.35 + Math.min(0.65, smoothSpeed * 0.3), bornAt: now, lifetime: 650 + brushRadius * 20, opacity: 0.17 });

      }
      strokeLength += distance;
      if (dabs.length > MAX_DABS) dabs.splice(0, dabs.length - MAX_DABS);
      lastPoint = { x: event.clientX, y: event.clientY, time: now };
    };

    const queueStroke = (event: PointerEvent) => {
      pendingPointer = event;
      wakeRenderer();
    };
    const visibilityChange = () => { if (document.hidden) clearStroke(); };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", queueStroke, { passive: true });
    document.documentElement.addEventListener("pointerleave", clearStroke);
    window.addEventListener("blur", clearStroke);
    window.addEventListener("scroll", clearStroke, { passive: true });
    window.addEventListener("pointercancel", clearStroke);
    document.addEventListener("visibilitychange", visibilityChange);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", queueStroke);
      document.documentElement.removeEventListener("pointerleave", clearStroke);
      window.removeEventListener("blur", clearStroke);
      window.removeEventListener("scroll", clearStroke);
      window.removeEventListener("pointercancel", clearStroke);
      document.removeEventListener("visibilitychange", visibilityChange);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-ink-cursor" aria-hidden="true" />;
}
