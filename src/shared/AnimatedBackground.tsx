import React, { useRef, useEffect } from "react";

export default function AnimatedBackground({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    let raf = 0, t = 0;

    const resize = () => {
      canvas.width = Math.floor(canvas.clientWidth * DPR);
      canvas.height = Math.floor(canvas.clientHeight * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.max(60, Math.floor(w / 18));
      const rows = Math.max(12, Math.floor(h / 26));

      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x0 = (i / (cols - 1)) * w;
          const y0 = (j / (rows - 1)) * h;
          const wave =
            Math.sin(i * 0.11 + t * 0.5) * 10 +
            Math.cos(j * 0.17 + t * 0.3) * 5;
          const x = x0 + wave * 0.35;
          const y = y0 + Math.cos(i * 0.08 + t) * 5;
          ctx.fillRect(x - 0.5, y - 2.5, 1, 5);
        }
      }

      // gentle vertical vignette like Raen
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(7,12,24,0.25)");
      g.addColorStop(1, "rgba(7,12,24,0.55)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      t += 0.008;
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}