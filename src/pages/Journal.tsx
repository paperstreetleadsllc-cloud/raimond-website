import { posts } from "../content/posts";

export default function JournalPage() {
  const items = [...posts].sort((a,b) => (a.date < b.date ? 1 : -1));
  return (
    <section className="pt-28 pb-20">
      <div className="section">
        <h1 className="text-3xl font-bold">Journal</h1>
        <p className="text-slate-400 mt-2">Updates, trading craft, and RAi product notes.</p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {items.map(p => (
            <article key={p.slug} className="p-6 glass rounded-lg">
              <div className="text-xs text-slate-400">{new Date(p.date).toLocaleDateString()}</div>
              <h3 className="mt-1 font-semibold">{p.title}</h3>
              <p className="text-sm text-slate-400 mt-2">{p.excerpt}</p>
              <a className="link mt-3 inline-block" href="#">Read (coming soon)</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

