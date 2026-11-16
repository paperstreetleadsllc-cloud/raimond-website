/** Side-by-side picture of the shift from a list of links to a single written answer. */
export function ThenNow() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <figure className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <figcaption className="text-lg font-bold text-ink">Before: a list of links</figcaption>
        <p className="mt-1 text-[15px] text-muted">The customer scrolled and picked. Page one had room for ten businesses.</p>
        <div aria-hidden="true" className="mt-6 space-y-3.5">
          {[72, 58, 80, 64, 76, 52, 68].map((w, i) => (
            <div key={i}>
              <div className="h-2.5 rounded-full bg-ink/25" style={{ width: `${w}%` }} />
              <div className="mt-1.5 h-1.5 rounded-full bg-line" style={{ width: `${w + 14}%` }} />
            </div>
          ))}
        </div>
      </figure>

      <figure className="rounded-3xl bg-ink p-6 text-white sm:p-8">
        <figcaption className="text-lg font-bold">Now: one answer</figcaption>
        <p className="mt-1 text-[15px] text-white/70">The AI reads the websites itself, then names two or three businesses.</p>
        <div aria-hidden="true" className="mt-6 rounded-2xl bg-white/10 p-5">
          <div className="h-2 w-11/12 rounded-full bg-white/30" />
          <div className="mt-2 h-2 w-4/5 rounded-full bg-white/30" />
          <div className="mt-5 space-y-2.5">
            {[44, 52, 38].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-brand" />
                <span className="h-3 rounded-full bg-teal-brand" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-5 h-2 w-3/5 rounded-full bg-white/30" />
        </div>
        <p className="mt-5 text-[15px] font-semibold text-teal-brand">Everyone else is simply not in the answer.</p>
      </figure>
    </div>
  );
}
