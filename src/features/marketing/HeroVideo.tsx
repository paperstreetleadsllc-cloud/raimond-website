import React from "react";
import { ScanlineEffect } from "./NeuralBackground";

export default function HeroVideo() {
  return (
    <div className="relative glass-card card-radius-lg border-white/12 bg-white/[0.08] p-6 text-white shadow-[0_40px_90px_rgba(5,10,22,0.6)] backdrop-blur-xl">
      <ScanlineEffect />
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-35"
        style={{
          background:
            "linear-gradient(135deg, rgba(31,240,218,0.24) 0%, rgba(74,144,226,0.18) 52%, rgba(31,240,218,0.24) 100%)",
          backdropFilter: "blur(2px)"
        }}
      />
      <div className="relative overflow-hidden rounded-[inherit] border border-[var(--cyber-teal)]/28 bg-[#020612]/60">
        <video
          src="/sora/raimond-commercial.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full rounded-[inherit] object-cover"
        />
      </div>
    </div>
  );
}


