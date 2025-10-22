import { motion } from "framer-motion";
import hud from "../assets/hud-mockup.png";
import AnimatedBackground from "../shared/AnimatedBackground";

export default function Hero() {
  return (
    <section className="relative bg-hero-gradient min-h-[92vh] flex items-center pt-24" aria-label="Hero">
      {/* NEW: animated background */}
      <AnimatedBackground />

      <div className="section py-12 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
              RAimond â€” RAi: your AI trading partner
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-xl">
              Institutional-grade infrastructure and an AI assistant that enforces discipline, logs trades,
              and gives real-time voice & HUD coaching â€” built for serious traders who want consistency.
            </p>
            <div className="mt-8 flex gap-4">
              <a href="#product" className="btn-primary">See RAi Features</a>
              <a href="#careers" className="btn-ghost">Join the beta</a>
            </div>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300/80">
              <li>â€¢ Real-time trade monitoring & voice overlays</li>
              <li>â€¢ Discipline lockouts & daily reviews</li>
              <li>â€¢ Integrations: Topstep, Sierra Chart, Bookmap</li>
              <li>â€¢ Trade journaling + analytics</li>
            </ul>
          </div>

          <div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <motion.img
                src={hud}
                alt="RAi HUD mockup"
                className="w-full h-80 object-cover bg-black/40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3">
              HUD preview â€” customizable voice, overlays, and real-time reminders.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
