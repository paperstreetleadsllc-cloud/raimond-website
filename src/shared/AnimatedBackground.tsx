export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* moving gradients */}
      <div
        className="absolute inset-0 animate-bg"
        style={{
          background:
            "radial-gradient(1200px 600px at 70% 20%, rgba(255,176,32,0.06), transparent 60%)," +
            "radial-gradient(900px 500px at 10% 30%, rgba(59,130,246,0.06), transparent 60%)," +
            "linear-gradient(180deg, #060b22 0%, #0d183d 55%, #101829 100%)",
        }}
      />
      {/* soft noise overlay */}
      <div className="noise absolute inset-0 opacity-[0.06] mix-blend-soft-light" />
    </div>
  );
}