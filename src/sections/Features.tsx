import React from "react";

export default function Features(){
  return (
    <section id="features" className="relative section-pad">
      <div className="container">
        <div className="mb-8">
          <div className="chip mb-3"><span className="chip-dot" /> Capabilities</div>
          <h2 className="text-3xl md:text-4xl font-semibold text-white">Multiple strategies. One assistant.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="card"><h4>Systematic</h4><p>Auto-pattern detection, backtest insights, and smart alerts for your algos.</p></div>
          <div className="card"><h4>Discretionary</h4><p>Voice overlay, journaling, and real-time coaching that improves decision quality.</p></div>
          <div className="card"><h4>Risk & Ops</h4><p>Drawdown limits, lockouts, reconciliation tools, and exportable reports.</p></div>
        </div>
      </div>
    </section>
  );
}