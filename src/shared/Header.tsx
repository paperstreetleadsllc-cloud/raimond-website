import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoWord from "../brand/LogoWord";
import { useAuth } from "../hooks/useAuth";
import useStickyHeader from "../hooks/useStickyHeader";

const marketingLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#architecture" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "About", href: "/#why" }
];

type HeaderProps = {
  onOpenWaitlist?: () => void;
};

export default function Header({ onOpenWaitlist }: HeaderProps) {
  const scrolled = useStickyHeader();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const handleSignOut = React.useCallback(() => {
    logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);

  const handleWaitlistOpen = React.useCallback(() => {
    if (onOpenWaitlist) {
      onOpenWaitlist();
      return;
    }

    const heroSection = document.getElementById("hero");
    heroSection?.scrollIntoView({ behavior: "smooth" });
  }, [onOpenWaitlist]);

  const activeHash = location.hash;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[var(--night-850)]/95 shadow-[0_20px_50px_rgba(3,8,18,0.55)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <Link to="/" className="flex items-center gap-3 text-white">
          <LogoWord className="h-auto" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white/65 lg:flex">
          {marketingLinks.map((link) => {
            const normalizedHash = link.href.replace("/#", "#");
            const isActive = activeHash === normalizedHash;

            return (
              <a
                key={link.label}
                href={link.href}
                className={`transition duration-200 hover:text-white ${
                  isActive ? "text-white" : ""
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/app"
                className="text-sm font-semibold text-white/75 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
              >
                Go to app
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-white/55 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-white/75 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={handleWaitlistOpen}
            className="inline-flex items-center justify-center rounded-full bg-[var(--cyber-teal)] px-5 py-2 text-sm font-semibold text-[var(--deep-navy)] shadow-[0_18px_45px_rgba(31,240,218,0.35)] transition hover:bg-[#59f6e4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/60"
          >
            Get Early Access
          </button>
        </div>
      </div>
    </header>
  );
}
