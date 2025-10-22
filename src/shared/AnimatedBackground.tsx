import React, { useRef, useEffect } from "react";

export default function AnimatedBackground({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      canvas.width = Math.floor(canvas.clientWidth * DPR);
      canvas.height = Math.floor(canvas.clientHeight * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    let t = 0;
    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.max(40, Math.floor(w / 24));
      const rows = Math.max(8, Math.floor(h / 28));

      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x0 = (i / (cols - 1)) * w;
          const y0 = (j / (rows - 1)) * h;
          const wave = Math.sin((i * 0.12) + (t * 0.6)) * 12 + Math.cos((j * 0.18) + (t * 0.3)) * 6;
          const x = x0 + (wave * 0.5);
          const y = y0 + (Math.cos((i * 0.1) + t) * 6);
          ctx.fillRect(x - 0.6, y - 2.8, 1.2, 5.6);
        }
      }

      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(8,13,30,0.22)");
      g.addColorStop(1, "rgba(10,18,30,0.6)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      t += 0.01;
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}