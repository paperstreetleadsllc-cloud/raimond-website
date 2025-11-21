import { motion } from "framer-motion";

const partners = [
  "Voxel Capital",
  "Aurora Labs",
  "PrimeX Markets",
  "Helix Quant",
  "Equinox Exchange"
];

export function TrustStrip() {
  return (
    <section
      id="trust"
      aria-label="Trusted by leading traders"
      className="relative border-y border-white/5 bg-[var(--night-850)]/90 py-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,240,218,0.12),_transparent_70%)] opacity-60" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 text-white/60 sm:flex-row sm:justify-between">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.36em] text-white/45 sm:text-sm"
        >
          Trusted by traders deploying RAimond
        </motion.span>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-medium text-white/70 sm:text-base">
          {partners.map((partner, index) => (
            <motion.span
              key={partner}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="transition hover:text-white"
            >
              {partner}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
