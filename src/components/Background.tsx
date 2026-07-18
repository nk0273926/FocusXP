import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { getLevelInfo } from '../utils/levels';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalXP = useGameStore((s) => s.totalXP);
  const theme = useGameStore((s) => s.settings.theme);
  const levelInfo = getLevelInfo(totalXP);

  const baseHue = levelInfo.level < 5 ? 180 : levelInfo.level < 8 ? 150 : 320;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const isDark = theme === 'dark';

    const particles: Particle[] = [];
    const count = Math.min(80, Math.floor((w * h) / 18000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        hue: baseHue + (Math.random() - 0.5) * 40,
      });
    }

    let mouseX = w / 2;
    let mouseY = h / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
    }

    function onResize() {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);

    let raf = 0;
    function tick() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, w, h);

      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;
      if (isDark) {
        const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300);
        glow.addColorStop(0, `hsla(${baseHue}, 100%, 60%, 0.08)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x += dx * 0.005;
          p.y += dy * 0.005;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `hsla(${p.hue}, 100%, 65%, ${p.opacity})`
          : `hsla(${p.hue}, 80%, 50%, ${p.opacity * 0.4})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `hsla(${baseHue}, 100%, 60%, ${0.08 * (1 - dist / 120)})`
              : `hsla(${baseHue}, 80%, 50%, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, [baseHue, theme]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] animate-float"
        style={{ background: `radial-gradient(circle, hsl(${baseHue}, 100%, 50%), transparent 70%)` }}
      />
      <div
        className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] animate-float"
        style={{
          background: `radial-gradient(circle, hsl(${baseHue + 30}, 100%, 50%), transparent 70%)`,
          animationDelay: '2s',
        }}
      />
      <div
        className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] animate-float"
        style={{
          background: `radial-gradient(circle, hsl(${baseHue - 30}, 100%, 50%), transparent 70%)`,
          animationDelay: '4s',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(${baseHue}, 100%, 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(${baseHue}, 100%, 50%) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
