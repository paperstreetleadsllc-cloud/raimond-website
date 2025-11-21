const NAV_LINKS = [
  { label: "Overview", active: true },
  { label: "Order Flow", active: false },
  { label: "Analytics", active: false },
  { label: "Automation", active: false },
  { label: "Journal", active: false },
  { label: "Settings", active: false }
];

export default function SidebarNav() {
  return (
    <aside className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_34px_70px_rgba(10,35,60,0.35)]">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Navigator</p>
        <h2 className="mt-2 text-sm font-semibold text-white/90">Control Center</h2>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            className={`flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-left font-medium transition ${
              link.active
                ? "bg-gradient-to-r from-[#1FF0DA]/15 to-[#4B7CF5]/15 text-white"
                : "text-white/60 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {link.label}
            {link.active ? (
              <span className="inline-flex h-2 w-2 rounded-full bg-[#1FF0DA]" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </nav>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs uppercase tracking-[0.35em] text-[#1FF0DA]">Alpha Models</div>
        <p className="text-sm font-semibold text-white">Signal confidence</p>
        <div className="mt-3 h-2 w-full rounded-full bg-white/5">
          <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#1FF0DA] via-[#3CAFF0] to-[#4B7CF5]" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">68% Alignment</p>
      </div>
    </aside>
  );
}










