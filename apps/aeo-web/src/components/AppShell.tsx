import { Link, NavLink, Outlet } from "react-router-dom";

const navClass = ({ isActive }: { isActive: boolean }): string =>
  [
    "rounded-md px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-cyan-400/15 text-cyan-100 border border-cyan-300/35"
      : "text-slate-300 border border-transparent hover:border-cyan-300/25 hover:text-cyan-100",
  ].join(" ");

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-cyan-300/15 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex w-[min(1100px,92vw)] items-center justify-between py-4">
          <Link to="/" className="text-sm font-semibold tracking-wide text-cyan-100">
            AEO Dashboard
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/sites" className={navClass}>
              Sites
            </NavLink>
            <NavLink to="/pricing" className={navClass}>
              Pricing
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-[min(1100px,92vw)] py-8">
        <Outlet />
      </main>
    </div>
  );
}
