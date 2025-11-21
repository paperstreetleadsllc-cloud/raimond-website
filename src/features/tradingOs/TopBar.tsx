import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function TopBar() {
  const [time, setTime] = useState(() => new Date());
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = window.setInterval(() => setTime(new Date()), 1000 * 30);
    return () => window.clearInterval(interval);
  }, []);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: undefined,
    hour12: true,
    timeZoneName: "short"
  }).format(time);

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] px-8 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.45em] text-[#1FF0DA]">Trading OS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          Next-Gen Execution Console
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-[0.4em] text-white/40">Status</span>
          <span className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-white">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#1FF0DA]" />
            Synced
          </span>
        </div>
        <div className="hidden h-12 w-px bg-white/10 md:block" />
        <div className="text-right">
          <span className="text-xs uppercase tracking-[0.4em] text-white/40">Session</span>
          <p className="mt-1 text-sm font-semibold text-white">{formattedTime}</p>
        </div>
        <div className="hidden h-12 w-px bg-white/10 md:block" />
        <div className="hidden h-12 w-px bg-white/10 md:block" />
        <div className="flex flex-col items-end text-xs uppercase tracking-[0.35em] text-white/40">
          <span>Account</span>
          <span className="mt-1 text-sm font-semibold normal-case text-white">
            {user?.email ?? "operator@raimond.ai"}
          </span>
        </div>
        <button className="rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#1FF0DA]/60 hover:bg-[#1FF0DA]/10">
          New Order
        </button>
        <button className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:text-white">
          Record Macro
        </button>
        <button
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-white/60 transition hover:border-[#FF7A7A]/40 hover:bg-[#FF7A7A]/10 hover:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
}


