import React from "react";

type Variant = "primary" | "outline";
type Size = "sm" | "md" | "lg";

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function mailtoHref(
  to: string,
  subject: string,
  body: string
) {
  const enc = (s: string) => encodeURIComponent(s);
  return `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
}

export default function Button({
  href,
  emailTo,
  emailSubject = "Join the RAImond Beta",
  emailBody = "Hi RAImond team,%0D%0A%0D%0AI'd like to join the beta. Here are a few details about my trading setup:",
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href?: string;                 // regular link
  emailTo?: string;              // if provided, creates a mailto link
  emailSubject?: string;
  emailBody?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  const padding =
    size === "lg" ? "px-6 py-3.5 text-lg" :
    size === "sm" ? "px-3.5 py-2.5 text-sm" :
                    "px-5 py-3 text-base";

  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70";

  const styles =
    variant === "primary"
      ? "text-slate-900 bg-gradient-to-r from-teal-300 to-emerald-400 hover:from-teal-200 hover:to-emerald-300 shadow-[0_10px_30px_rgba(16,185,129,.35)]"
      : "border border-teal-400/40 text-teal-200 hover:bg-teal-400/10";

  const url =
    emailTo
      ? mailtoHref(emailTo, emailSubject, emailBody)
      : (href || "#");

  return (
    <a href={url} className={clsx(base, styles, padding, className)}>
      {children}
    </a>
  );
}