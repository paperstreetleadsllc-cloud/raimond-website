import React, { useEffect, useRef } from "react";

/**
 * Neon orbital dots + scanlines + parallax shimmer
 * - Looks like a calm HUD backdrop behind the hero.
 */
export default function AnimatedBackground({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current!;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    function size() {
      const { clientWidth: w, clientHeight: h } = c;
      c.width = Math.floor(w * DPR);
      c.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    size();
    window.addEventListener("resize", size, { passive: true });

    // particles in soft orbits
    const P = 120;
    const dots = Array.from({ length: P }).map((_, i) => {
      const r = 30 + Math.random() * 260;       // orbit radius
      const a = Math.random() * Math.PI * 2;    // angle
      const s = 0.001 + Math.random() * 0.004;  // speed
      const z = 0.4 + Math.random() * 0.6;      // depth
      return { r, a, s, z };
    });

    let t = 0;
    function draw() {
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // subtle radial glow
      const g = ctx.createRadialGradient(w*0.65, h*0.35, 10, w*0.65, h*0.35, Math.max(w, h));
      g.addColorStop(0, "rgba(11, 208, 192, 0.08)");
      g.addColorStop(1, "rgba(5, 10, 20, 0.0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // orbits guides
      ctx.strokeStyle = "rgba(120, 220, 210, 0.08)";
      ctx.lineWidth = 1;
      for (let r = 90; r <= 300; r += 50) {
        ctx.beginPath();
        ctx.ellipse(w*0.65, h*0.35, r*1.2, r*0.6, 0.2, 0, Math.PI*2);
        ctx.stroke();
      }

      // dots moving on slightly skewed ellipses
      ctx.fillStyle = "rgba(190, 255, 246, 0.75)";
      dots.forEach(d => {
        d.a += d.s;
        const ex = Math.cos(d.a) * d.r * 1.2;
        const ey = Math.sin(d.a * 0.9) * d.r * 0.6;
        const x = w*0.65 + ex;
        const y = h*0.35 + ey;
        const size = 1 + (1-d.z) * 1.8;
        ctx.globalAlpha = 0.4 + 0.6 * Math.sin((d.a + t) * 0.5) ** 2;
        ctx.fillRect(x - size/2, y - size/2, size, size);
      });

      ctx.globalAlpha = 1;

      // scanlines
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      // vignette
      const vg = ctx.createLinearGradient(0, 0, 0, h);
      vg.addColorStop(0, "rgba(0,0,0,0.25)");
      vg.addColorStop(0.35, "rgba(0,0,0,0.0)");
      vg.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      t += 0.01;
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); };
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}