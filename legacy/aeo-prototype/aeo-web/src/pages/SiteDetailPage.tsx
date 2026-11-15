import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { aeoApi, type AeoAudit, type AeoSite } from "../lib/aeoApi";

export default function SiteDetailPage() {
  const { id = "" } = useParams();
  const [site, setSite] = useState<AeoSite | null>(null);
  const [audit, setAudit] = useState<AeoAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const sites = await aeoApi.listSites();
        const selected = sites.find((item) => item.id === id) ?? null;
        setSite(selected);
        if (!selected) {
          setAudit(null);
          setError("Site not found.");
          return;
        }
        const latestAudit = await aeoApi.getLatestAudit(selected.id);
        setAudit(latestAudit);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load site.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Site Detail</h1>
          <p className="text-sm text-slate-400">View profile and latest audit score.</p>
        </div>
        <Link
          to="/sites"
          className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm text-slate-200 hover:border-cyan-300/35"
        >
          Back to Sites
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-300/35 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel rounded-2xl p-5 md:col-span-2">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Profile</p>
          {loading ? (
            <div className="mt-3 h-20 animate-pulse rounded-md bg-slate-800/70" />
          ) : site ? (
            <dl className="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">URL</dt>
                <dd className="break-all">{site.url}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Business Name</dt>
                <dd>{site.businessName || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Vertical</dt>
                <dd>{site.vertical || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Created</dt>
                <dd>{new Date(site.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          ) : null}
        </div>
        <div className="panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Latest Audit Score</p>
          {loading ? (
            <div className="mt-3 h-12 animate-pulse rounded-md bg-slate-800/70" />
          ) : (
            <p className="mt-3 text-4xl font-semibold text-cyan-100">
              {audit ? audit.totalScore : "--"}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {audit ? `Last run ${new Date(audit.createdAt).toLocaleString()}` : "No audits yet"}
          </p>
        </div>
      </div>

      {site ? (
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/sites/${site.id}/audit`}
            className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-400/15"
          >
            Run / View Audit
          </Link>
          <Link
            to={`/sites/${site.id}/plan`}
            className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm text-slate-200 hover:border-cyan-300/35"
          >
            Open Plan
          </Link>
        </div>
      ) : null}
    </section>
  );
}
