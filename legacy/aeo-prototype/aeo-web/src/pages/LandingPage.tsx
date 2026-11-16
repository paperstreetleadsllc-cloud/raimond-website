import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aeoApi, type AeoSite } from "../lib/aeoApi";

export default function LandingPage() {
  const [sites, setSites] = useState<AeoSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const nextSites = await aeoApi.listSites();
        setSites(nextSites);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load sites.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <section className="space-y-6">
      <div className="panel rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/85">AEO Visibility OS</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-100">AEO Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Standalone frontend for site tracking, audits, and action plans powered by the AEO API.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/sites"
            className="rounded-md border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/15"
          >
            Manage Sites
          </Link>
          <Link
            to="/pricing"
            className="rounded-md border border-cyan-300/20 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300/35"
          >
            View Pricing
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-300/35 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Tracked Sites</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{loading ? "..." : sites.length}</p>
        </div>
        <div className="panel rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">API Base</p>
          <p className="mt-2 break-all text-sm text-slate-200">
            {import.meta.env.VITE_AEO_API ?? "http://localhost:4000"}
          </p>
        </div>
        <div className="panel rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Quick Action</p>
          <Link to="/sites" className="mt-2 inline-block text-sm text-cyan-200 hover:text-cyan-100">
            Add a site and run first audit
          </Link>
        </div>
      </div>
    </section>
  );
}
