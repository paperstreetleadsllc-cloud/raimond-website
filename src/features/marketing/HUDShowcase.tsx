import { motion } from "framer-motion";
import { RAimondGlyph } from "./RAimondGlyph";

export function HUDShowcase() {
  return (
    <section id="hud" className="relative section-padding-md overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]" />
      <div className="absolute inset-0 neural-grid-dense opacity-8" />

      <div className="relative container mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative glass-card card-radius-md overflow-hidden border border-[#1FF0DA]/20 p-10 shadow-2xl shadow-[#1FF0DA]/10">
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-15"
              style={{
                background:
                  "linear-gradient(120deg, rgba(31,240,218,0.22), rgba(74,144,226,0.18), rgba(31,240,218,0.22))",
                backgroundSize: "180% 100%"
              }}
              animate={{ backgroundPosition: ["0% 0%", "200% 0%", "0% 0%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10 flex flex-col items-center gap-10 text-white">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="inline-flex items-center gap-4">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--cyber-teal)]/12">
                    <RAimondGlyph size={40} animated={false} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-['Space_Grotesk'] text-white">RAimond HUD Preview</h3>
                    <p className="text-sm uppercase tracking-[0.28em] text-white/45">Live interface snapshot</p>
                  </div>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
                  We’re surfacing the actual HUD traders will see inside RAImond. Screenshots from live sessions will appear
                  here as the private beta expands.
                </p>
              </div>

              <div className="flex w-full items-center justify-center">
                <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-14 text-center text-white/70">
                  <span className="text-lg font-semibold text-white">Live screenshots coming soon</span>
                  <p className="max-w-md text-sm text-white/55 sm:text-base">
                    Real captures from the RAImond console will replace this placeholder once the interface is cleared for
                    public viewing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
