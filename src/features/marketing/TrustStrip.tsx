import { motion } from "framer-motion";

export function TrustStrip() {
  return (
    <section
      id="trust"
      aria-label="Built for independent traders"
      className="relative border-y border-white/5 bg-[var(--night-850)]/90 py-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,240,218,0.12),_transparent_70%)] opacity-60" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 text-white/70">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.36em] text-white/45 sm:text-sm"
        >
          Built for independent traders
        </motion.span>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-sm leading-relaxed text-white/70 sm:text-base"
        >
          Currently in private beta with real futures and options traders, focused on discipline, execution, and real-time
          context.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs text-white/45 sm:text-sm"
        >
          No fake logos. Just honest infrastructure for traders who actually do this for a living.
        </motion.p>
      </div>
    </section>
  );
}
