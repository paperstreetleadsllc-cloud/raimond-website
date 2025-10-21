export default function WhatWeDo() {
  return (
    <section id="what" className="py-20">
      <div className="section">
        <h2 className="text-3xl font-bold">Multiple strategies. One assistant.</h2>
        <p className="mt-3 text-slate-300 max-w-3xl">
          RAimond supports systematic, discretionary, and hybrid workflows — providing tools, trade logging, and AI nudges to keep you disciplined and scalable.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <div className="p-6 glass rounded-lg">
            <h3 className="font-semibold">Systematic</h3>
            <p className="mt-2 text-sm text-slate-400">Auto-pattern detection, backtest insights, and live alerts for your algos.</p>
          </div>
          <div className="p-6 glass rounded-lg">
            <h3 className="font-semibold">Discretionary</h3>
            <p className="mt-2 text-sm text-slate-400">Personal HUD, voice coaching, and journal prompts that improve decision quality.</p>
          </div>
          <div className="p-6 glass rounded-lg">
            <h3 className="font-semibold">Risk & Ops</h3>
            <p className="mt-2 text-sm text-slate-400">Trade risk controls, daily max loss enforcement, and reconciliation tools.</p>
          </div>
        </div>
      </div>
    </section>
  );
}