import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aeoApi, type AeoSite } from "../lib/aeoApi";

type SiteFormState = {
  url: string;
  businessName: string;
  vertical: string;
  ownerEmail: string;
};

const initialFormState: SiteFormState = {
  url: "",
  businessName: "",
  vertical: "",
  ownerEmail: "",
};

export default function SitesPage() {
  const [sites, setSites] = useState<AeoSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<SiteFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);

  const loadSites = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void loadSites();
  }, [loadSites]);

  const onCreateSite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await aeoApi.createSite({
        url: form.url.trim(),
        businessName: form.businessName.trim() || undefined,
        vertical: form.vertical.trim() || undefined,
        ownerEmail: form.ownerEmail.trim() || undefined,
      });
      setForm(initialFormState);
      setCreateOpen(false);
      await loadSites();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create site.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Sites</h1>
          <p className="text-sm text-slate-400">Manage tracked websites for audits and plans.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/15"
        >
          Create Site
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-300/35 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="panel overflow-hidden rounded-2xl">
        <div className="border-b border-cyan-300/10 px-5 py-4">
          <h2 className="text-sm font-medium text-slate-200">Tracked Sites</h2>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-md bg-slate-800/70" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-cyan-300/10">
            {sites.map((site) => (
              <div
                key={site.id}
                className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">{site.businessName || site.url}</p>
                  <p className="text-xs text-slate-400">{site.url}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/sites/${site.id}`}
                    className="rounded-md border border-cyan-300/20 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-300/35"
                  >
                    View
                  </Link>
                  <Link
                    to={`/sites/${site.id}/audit`}
                    className="rounded-md border border-cyan-300/20 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-300/35"
                  >
                    Audit
                  </Link>
                  <Link
                    to={`/sites/${site.id}/plan`}
                    className="rounded-md border border-cyan-300/20 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-300/35"
                  >
                    Plan
                  </Link>
                </div>
              </div>
            ))}
            {sites.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-400">
                No sites yet. Create your first site to start running audits.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="panel w-full max-w-lg rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Create Site</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300"
              >
                Close
              </button>
            </div>
            <form className="mt-4 space-y-3" onSubmit={onCreateSite}>
              <label className="block text-xs uppercase tracking-[0.12em] text-slate-400">
                URL
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                  placeholder="https://example.com"
                  className="mt-1 w-full rounded-md border border-cyan-300/20 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.12em] text-slate-400">
                Business Name
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, businessName: event.target.value }))
                  }
                  placeholder="Acme Insurance"
                  className="mt-1 w-full rounded-md border border-cyan-300/20 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.12em] text-slate-400">
                Vertical
                <input
                  type="text"
                  value={form.vertical}
                  onChange={(event) => setForm((prev) => ({ ...prev, vertical: event.target.value }))}
                  placeholder="insurance"
                  className="mt-1 w-full rounded-md border border-cyan-300/20 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.12em] text-slate-400">
                Owner Email
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, ownerEmail: event.target.value }))
                  }
                  placeholder="owner@company.com"
                  className="mt-1 w-full rounded-md border border-cyan-300/20 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
