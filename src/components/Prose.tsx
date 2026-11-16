export function Prose({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-16">
      <article className="mx-auto max-w-3xl space-y-5 leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-500">Last updated {updated}</p>
        {children}
      </article>
    </div>
  );
}
