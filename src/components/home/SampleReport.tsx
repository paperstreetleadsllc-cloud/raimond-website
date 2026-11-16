/**
 * A picture of what the free report looks like. The numbers are an invented
 * example and are labelled as such; they are not results for a real business.
 */
const ROWS: [string, number][] = [
  ["Can AI get into the site", 80],
  ["Business details in a format AI reads", 35],
  ["Services and service area stated clearly", 70],
  ["Name, address and phone consistent", 90],
  ["Reviews, licences and other trust signals", 55],
  ["Customer questions answered on the page", 40],
];

export function SampleReport() {
  return (
    <figure>
      <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-line pb-5">
          <div>
            <p className="text-sm font-semibold text-muted">AI Readiness Score</p>
            <p className="mt-1 font-display text-6xl font-bold leading-none text-ink" style={{ fontStretch: "112%" }}>
              62<span className="ml-2 whitespace-nowrap text-xl font-semibold text-muted">out of 100</span>
            </p>
          </div>
          <span className="rounded-full bg-signal-wash px-3 py-1 text-sm font-semibold text-signal-ink">Room to improve</span>
        </div>

        <ul className="mt-5 space-y-3.5">
          {ROWS.map(([label, value]) => (
            <li key={label}>
              <div className="flex justify-between gap-4 text-[15px]">
                <span className="font-medium text-ink">{label}</span>
                <span className="tabular-nums text-muted">{value}</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-paper-deep" aria-hidden="true">
                <div className={`h-2 rounded-full ${value < 50 ? "bg-signal" : "bg-teal-deep"}`} style={{ width: `${value}%` }} />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl bg-paper-deep p-5">
          <p className="text-sm font-semibold text-muted">Fix this first</p>
          <p className="mt-1 font-semibold leading-snug text-ink">Add your business name, services, phone number and service area in the format AI systems read.</p>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted">Example report. The numbers are made up to show the layout.</figcaption>
    </figure>
  );
}
