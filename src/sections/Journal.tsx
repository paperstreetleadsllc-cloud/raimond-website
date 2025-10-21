export default function Journal() {
  return (
    <section id="journal" className="py-20 bg-brand-slate/30">
      <div className="section">
        <h3 className="text-lg font-semibold">Journal & Updates</h3>
        <p className="mt-2 text-slate-400">Short articles and product updates — daily review tips and trading excellence pieces.</p>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <article className="p-6 glass rounded-lg">
            <h4 className="font-semibold">Building a Modern Trading Desk</h4>
            <p className="text-sm text-slate-400 mt-2">Best practices for execution and infrastructure.</p>
          </article>
          <article className="p-6 glass rounded-lg">
            <h4 className="font-semibold">Understanding Edge & Efficiency</h4>
            <p className="text-sm text-slate-400 mt-2">How to find and protect your edge.</p>
          </article>
          <article className="p-6 glass rounded-lg">
            <h4 className="font-semibold">Discipline: The Unfair Advantage</h4>
            <p className="text-sm text-slate-400 mt-2">Systematic ways to stop overtrading.</p>
          </article>
        </div>
      </div>
    </section>
  );
}