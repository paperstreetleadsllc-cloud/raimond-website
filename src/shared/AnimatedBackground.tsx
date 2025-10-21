import React, { useEffect, useRef } from "react";

const AnimatedBackground: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  // Optional micro-parallax
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w - 0.5) * 4;
      const y = (e.clientY / h - 0.5) * 4;
      el.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      <div
        ref={ref}
        className="absolute -inset-12 will-change-transform"
        style={{
          background: `
            conic-gradient(
              from 180deg,
              rgba(255,176,32,0.10),
              rgba(50,116,255,0.10),
              rgba(0,0,0,0.10),
              rgba(255,176,32,0.10)
            ),
            radial-gradient(60% 60% at 50% 40%,
              rgba(255,176,32,0.14),
              rgba(21,30,60,0.0) 70%)`,
          filter: "saturate(110%) blur(0.3px)",
          animation: "spin-slow 40s linear infinite",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\" viewBox=\"0 0 160 160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.7\" numOctaves=\"2\" stitchTiles=\"stitch\"/><feColorMatrix type=\"saturate\" values=\"0\"/><feComponentTransfer><feFuncA type=\"table\" tableValues=\"0 0 0 0 0.06\"/></feComponentTransfer></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\"/></svg>')",
          opacity: 0.25,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
