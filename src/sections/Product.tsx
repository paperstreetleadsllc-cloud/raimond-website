export default function Product() {
  return (
    <section id="product" className="py-20 bg-brand-slate/30">
      <div className="section">
        <h2 className="text-2xl font-bold">RAi Features</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 glass rounded-lg">
              <h4 className="font-semibold">Voice Overlay</h4>
              <p className="text-slate-400 mt-2 text-sm">Customizable voice prompts (e.g., daily review, cooldowns, reminders) with mute and voice selection.</p>
            </div>
            <div className="p-6 glass rounded-lg">
              <h4 className="font-semibold">Trade Journal & Review</h4>
              <p className="text-slate-400 mt-2 text-sm">Automatic trade capture, tagging, and a guided end-of-day review workflow.</p>
            </div>
            <div className="p-6 glass rounded-lg">
              <h4 className="font-semibold">Platform Integrations</h4>
              <p className="text-slate-400 mt-2 text-sm">Connect Topstep, Sierra Chart, Bookmap, and your broker for live data and trade sync.</p>
            </div>
          </div>

          <div className="p-6 rounded-xl glass">
            <h3 className="font-semibold">Discipline Engine</h3>
            <p className="mt-3 text-slate-300">Set hard daily loss limits, automatic lockouts, and escalation rules — RAi enforces them so you don’t have to.</p>

            <dl className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <div className="font-bold text-amber-400">01</div>
                <div>Session tracking, max daily loss enforcement, cooldown timers.</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-bold text-amber-400">02</div>
                <div>Post-trade AI feedback and pattern detection for recurring mistakes.</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-bold text-amber-400">03</div>
                <div>Exportable performance reports and edge tracking.</div>
              </div>
            </dl>

            <div className="mt-6">
              <a href="#contact" className="btn-primary">Request Beta Access</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}