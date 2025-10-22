import { motion } from "framer-motion";
import hud from "../assets/hud-mockup.png";

export default function Hero() {
  return (
    <section className="hero-wrap pt-28 pb-24 md:pt-32 md:pb-28">
      <div className="hero-noise" />
      <div className="section relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Left copy */}
          <div>
            <h1 className="h1">RAimond – RAI: your AI trading partner</h1>
            <p className="p-lg mt-4 max-w-xl text-slate-300">
              Institutional-grade infrastructure and an AI assistant that enforces discipline, logs trades, and gives real-time voice &amp; HUD coaching – built for serious traders who want consistency.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#features" className="btn-amber">See RAI Features</a>
              <a href="/#beta" className="btn-ghost">Join the beta</a>
            </div>

            <ul className="mt-6 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
              <li>• Real-time trade monitoring &amp; voice overlays</li>
              <li>• Discipline lockouts &amp; daily reviews</li>
              <li>• Integrations: Topstep, Sierra Chart, Bookmap</li>
              <li>• Trade journaling + analytics</li>
            </ul>
          </div>

          {/* Right visual */}
          <motion.div
            className="glass p-3 md:p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <img
              src={hud}
              alt="HUD preview"
              className="w-full rounded-lg object-cover"
            />
            <p className="p-sm mt-2 text-center text-slate-400">
              HUD preview — customizable voice, overlays, and real-time reminders.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}