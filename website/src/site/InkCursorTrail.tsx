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

const MAX_DABS = 120;
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
    let pixelRatio = 1;
    let pendingPointer: PointerEvent | null = null;
    let dirty: { x: number; y: number; width: number; height: number } | null = null;
    // Bake the wash once. Drawing a small bitmap avoids rebuilding hundreds of
    // radial gradients during every frame of a stroke.
    const stamp = document.createElement("canvas");
    stamp.width = stamp.height = 64;
    const brush = stamp.getContext("2d");
    if (!brush) return;
    const wash = brush.createRadialGradient(32, 32, 2.56, 32, 32, 32);
    wash.addColorStop(0, "rgba(22,24,21,1)");
    wash.addColorStop(0.42, "rgba(28,30,26,.72)");
    wash.addColorStop(0.78, "rgba(45,46,39,.18)");
    wash.addColorStop(1, "rgba(45,46,39,0)");
    brush.fillStyle = wash;
    brush.fillRect(0, 0, 64, 64);

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
      if (dirty) context.clearRect(dirty.x, dirty.y, dirty.width, dirty.height);
      let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
      for (let index = dabs.length - 1; index >= 0; index -= 1) {
        const dab = dabs[index];
        const progress = Math.max(0, (now - dab.bornAt) / dab.lifetime);
        if (progress >= 1) {
          dabs.splice(index, 1);
          continue;
        }
        const fade = Math.pow(1 - progress, 1.7);
        const radius = dab.radius * (1 + progress * 0.38);
        const extent = radius * dab.stretch + 3 / pixelRatio;
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
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    const addStroke = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const hoveredElement = event.target instanceof Element ? event.target : null;
      if (hoveredElement?.closest(".home-gallery-corridor")) {
        clearStroke();
        return;
      }
      const now = performance.now();
      if (!lastPoint) {
        lastPoint = { x: event.clientX, y: event.clientY, time: now };
        return;
      }
      const dx = event.clientX - lastPoint.x;
      const dy = event.clientY - lastPoint.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) return;
      const elapsed = Math.max(8, now - lastPoint.time);
      const speed = distance / elapsed;
      const angle = Math.atan2(dy, dx);
      const brushRadius = Math.max(4.5, Math.min(13, 12.5 - speed * 4.2));
      const steps = Math.min(14, Math.max(1, Math.ceil(distance / 5)));
      for (let step = 1; step <= steps; step += 1) {
        const ratio = step / steps;
        const x = lastPoint.x + dx * ratio;
        const y = lastPoint.y + dy * ratio;
        const pressureWave = 0.84 + Math.sin((now + step * 19) * 0.025) * 0.14;
        dabs.push({ x, y, radius: brushRadius * pressureWave, angle, stretch: 1.5 + Math.min(0.8, speed), bornAt: now, lifetime: 820 + brushRadius * 32, opacity: 0.12 });
        if (step % 3 === 0) {
          const normalX = -Math.sin(angle);
          const normalY = Math.cos(angle);
          const offset = Math.sin(now * 0.013 + step) * brushRadius * 0.72;
          dabs.push({ x: x + normalX * offset, y: y + normalY * offset, radius: brushRadius * 0.46, angle, stretch: 1.85, bornAt: now + 35, lifetime: 1100, opacity: 0.065 });
        }
      }
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
    document.addEventListener("visibilitychange", visibilityChange);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", queueStroke);
      document.documentElement.removeEventListener("pointerleave", clearStroke);
      window.removeEventListener("blur", clearStroke);
      document.removeEventListener("visibilitychange", visibilityChange);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-ink-cursor" aria-hidden="true" />;
}
