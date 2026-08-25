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

const MAX_DABS = 280;

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

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(window.innerWidth * pixelRatio));
      canvas.height = Math.max(1, Math.round(window.innerHeight * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const render = (now: number) => {
      animationFrame = 0;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let index = dabs.length - 1; index >= 0; index -= 1) {
        const dab = dabs[index];
        const progress = (now - dab.bornAt) / dab.lifetime;
        if (progress >= 1) {
          dabs.splice(index, 1);
          continue;
        }
        const fade = Math.pow(1 - progress, 1.7);
        const radius = dab.radius * (1 + progress * 0.38);
        context.save();
        context.translate(dab.x, dab.y);
        context.rotate(dab.angle);
        context.scale(dab.stretch, 1);
        const wash = context.createRadialGradient(0, 0, radius * 0.08, 0, 0, radius);
        wash.addColorStop(0, `rgba(22, 24, 21, ${dab.opacity * fade})`);
        wash.addColorStop(0.42, `rgba(28, 30, 26, ${dab.opacity * 0.72 * fade})`);
        wash.addColorStop(0.78, `rgba(45, 46, 39, ${dab.opacity * 0.18 * fade})`);
        wash.addColorStop(1, "rgba(45, 46, 39, 0)");
        context.fillStyle = wash;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      if (dabs.length) animationFrame = window.requestAnimationFrame(render);
    };

    const wakeRenderer = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(render);
    };

    const addStroke = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
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
      wakeRenderer();
    };

    const resetStroke = () => { lastPoint = null; };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", addStroke, { passive: true });
    window.addEventListener("pointerleave", resetStroke);
    window.addEventListener("blur", resetStroke);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", addStroke);
      window.removeEventListener("pointerleave", resetStroke);
      window.removeEventListener("blur", resetStroke);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-ink-cursor" aria-hidden="true" />;
}
