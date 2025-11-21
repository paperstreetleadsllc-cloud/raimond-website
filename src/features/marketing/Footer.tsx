import { Link } from "react-router-dom";
import { Twitter, Linkedin, Youtube, Github, Mail } from "lucide-react";
import { RAimondGlyph } from "./RAimondGlyph";
import { motion } from "framer-motion";

const currentYear = new Date().getFullYear();

export default function MarketingFooter() {
  return (
    <footer className="relative border-t border-[#1FF0DA]/10 bg-[#0a0e1a]">
      <div className="absolute inset-x-0 top-0 h-px">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-[#1FF0DA]/60 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center top, rgba(31, 240, 218, 0.12) 0%, transparent 70%)" }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 neural-grid-subtle opacity-20" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <RAimondGlyph size={40} animated={false} />
            <span className="text-xl font-bold text-white font-['Space_Grotesk']">RAimond</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Neural-Execution Trading OS. Institutional-grade intelligence for independent traders.
          </p>
          <div className="flex gap-3">
            {[Twitter, Linkedin, Youtube, Github].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a2332] text-gray-400 transition-all hover:text-[#1FF0DA] hover:bg-[#1FF0DA]/10 hover:shadow-[0_0_15px_rgba(31,240,218,0.3)]"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-['Space_Grotesk'] text-white">Product</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/#features" className="transition-colors hover:text-[#1FF0DA]">
                Features
              </a>
            </li>
            <li>
              <a href="/#pricing" className="transition-colors hover:text-[#1FF0DA]">
                Pricing
              </a>
            </li>
            <li>
              <Link to="/dashboard" className="transition-colors hover:text-[#1FF0DA]">
                Dashboard
              </Link>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-[#1FF0DA]">
                Documentation
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-['Space_Grotesk'] text-white">Company</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/#why" className="transition-colors hover:text-[#1FF0DA]">
                About
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-[#1FF0DA]">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-[#1FF0DA]">
                Careers
              </a>
            </li>
            <li>
              <a href="mailto:hello@raimondai.com" className="transition-colors hover:text-[#1FF0DA]">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-['Space_Grotesk'] text-white">Join the Broadcast List</h4>
          <p className="mb-4 text-sm text-gray-400">Get the latest updates and trading insights.</p>
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-full bg-[#131926] border border-[#1FF0DA]/20 px-10 py-2.5 text-white placeholder:text-gray-500 focus:border-[#1FF0DA]/40 focus:shadow-[0_0_15px_rgba(31,240,218,0.2)] focus:outline-none transition"
              />
            </div>
            <button
              type="button"
              className="w-full rounded-full bg-[var(--cyber-teal)] px-7 py-3 text-base font-semibold text-[var(--deep-navy)] shadow-[0_0_20px_rgba(31,240,218,0.3)] transition hover:bg-[var(--cyber-teal)]/90 hover:shadow-[0_0_30px_rgba(31,240,218,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/60"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 border-t border-[#1FF0DA]/10 px-4 py-6 text-sm text-gray-500 md:flex-row md:px-8">
        <span>© {currentYear} RAimond. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-[#1FF0DA]">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-[#1FF0DA]">
            Terms of Service
          </a>
          <a href="#" className="transition-colors hover:text-[#1FF0DA]">
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
