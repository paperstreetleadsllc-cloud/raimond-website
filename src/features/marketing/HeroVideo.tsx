import React, { useCallback, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ScanlineEffect } from "./NeuralBackground";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (!video) {
      return;
    }

    video.muted = nextMuted;

    if (!nextMuted) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          setIsMuted(true);
        });
      }
    }
  }, [isMuted]);

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
          ref={videoRef}
          src="/sora/raimond-commercial.mp4"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          controls={false}
          preload="metadata"
          className="h-full w-full rounded-[inherit] object-cover"
        />
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          aria-pressed={!isMuted}
          className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:bg-black/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/55"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}



