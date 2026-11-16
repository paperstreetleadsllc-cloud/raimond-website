/**
 * Illustration of a customer asking an AI assistant for a local business.
 * The business names are invented and the mock is labelled as an example.
 */
export function AskAiMock() {
  return (
    <figure className="relative mx-auto w-full max-w-[420px]">
      <div className="rounded-[36px] bg-ink p-2.5 shadow-phone">
        <div className="rounded-[28px] bg-paper-deep px-5 pb-6 pt-5">
          <p className="text-center text-xs font-semibold text-muted">A customer, on their phone</p>

          <p className="ml-auto mt-5 w-fit max-w-[88%] rounded-3xl rounded-br-lg bg-ink px-5 py-3.5 text-[17px] font-medium leading-snug text-white">
            Who&apos;s a good plumber near me that can come out today?
          </p>

          <div className="mt-3 rounded-3xl rounded-bl-lg bg-white px-5 py-4 text-[16px] leading-snug">
            <p>Here are three plumbers near you that offer same-day service:</p>
            <ol className="mt-3 divide-y divide-line border-y border-line">
              {["Harbor Plumbing Co.", "Reliant Rooter", "Smith & Sons Plumbing"].map((name, i) => (
                <li key={name} className="flex items-center gap-3 py-2.5">
                  <span className="w-4 text-sm font-semibold text-muted">{i + 1}</span>
                  <span className="font-semibold text-ink">{name}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-3 rounded-2xl border-2 border-dashed border-signal bg-signal-wash px-5 py-4">
            <p className="text-[17px] font-bold leading-snug text-ink">Your business: not mentioned.</p>
            <p className="mt-1 text-[15px] leading-snug text-signal-ink">The customer calls one of those three.</p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted">Example for illustration. Business names are made up.</figcaption>
    </figure>
  );
}
