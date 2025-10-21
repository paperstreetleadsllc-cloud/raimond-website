async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const payload = {
    name: String(form.get("name") || ""),
    email: String(form.get("email") || ""),
    notes: String(form.get("notes") || ""),
  };
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    alert("Thanks! We’ll be in touch.");
    e.currentTarget.reset();
  } else {
    const data = await res.json().catch(() => ({}));
    alert(`Error: ${data?.error || "Unable to subscribe"}`);
  }
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="py-16 border-t border-white/10 mt-24">
      <div className="section grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold">Get early access</h3>
          <p className="text-slate-400 mt-2">Join the RAimond beta list for product launches, roadmap updates, and invites.</p>

          <form className="mt-6 grid gap-3 max-w-sm" onSubmit={handleSubmit}>
            <input name="name" className="px-4 py-3 rounded-md bg-white/5 border border-white/10" placeholder="Name" />
            <input name="email" className="px-4 py-3 rounded-md bg-white/5 border border-white/10" placeholder="Work email" />
            <textarea name="notes" className="px-4 py-3 rounded-md bg-white/5 border border-white/10" rows={3} placeholder="Tell us about your trading" />
            <button className="btn-primary">Request Beta</button>
          </form>
        </div>

        <div>
          <h4 className="font-semibold">Contact</h4>
          <p className="text-slate-400 mt-2">support@raimondai.com</p>

          <div className="mt-6 text-slate-400 text-sm">
            <p>© {year} RAimond AI — RAi</p>
          </div>
        </div>
      </div>
    </footer>
  );
}