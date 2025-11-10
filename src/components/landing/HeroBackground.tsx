export default function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* base surface stays from the theme */}
      <div
        className="absolute right-[-12%] top-[-10%] h-[52vh] w-[52vh] rounded-full
        bg-[radial-gradient(ellipse_at_center,rgba(31,240,218,0.22),transparent_60%)]
        blur-3xl"
      />
      <div
        className="absolute left-[8%] top-[30%] h-[36vh] w-[36vh] rounded-full
        bg-[radial-gradient(ellipse_at_center,rgba(31,240,218,0.12),transparent_60%)]
        blur-3xl"
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.10) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.10) 1px,transparent 1px)",
          backgroundSize: "48px 48px,48px 48px",
        }}
      />
    </div>
  );
}
