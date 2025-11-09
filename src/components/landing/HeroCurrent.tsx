import React from 'react';

/**
 * Original Hero component - preserved for feature flag fallback
 * This is the current production hero
 */
export default function HeroCurrent() {
  return (
    <section className="section">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <h1 className="h1 mb-5">
              The Trader's Edge — Powered by RAimond
            </h1>
            <p className="lede mb-6" style={{ maxWidth: '580px' }}>
              Trade without hesitation. RAimond learns your behavior, enforces your rules,
              and reads the market's intent through order flow and volume structure.
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                Adaptive HUD
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                Order Flow
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                VWAP Structure
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                Risk Meter
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a href="/signup" className="btn btn-primary">
                Start Free Trial
              </a>
              <a href="/product" className="btn btn-ghost">
                Get Started
              </a>
            </div>
          </div>

          {/* Right: Stat Cluster Card */}
          <div className="relative">
            <div className="glass glow-brand p-8 lg:p-10">
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                  Live Performance
                </h3>
                <p className="text-xs text-slate-400">Real-time coaching metrics</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Stat 1 */}
                <div>
                  <div className="text-3xl lg:text-4xl font-bold text-slate-100 mb-1">
                    12,847+
                  </div>
                  <div className="text-sm text-slate-400">Rules Enforced</div>
                </div>

                {/* Stat 2 */}
                <div>
                  <div className="text-3xl lg:text-4xl font-bold text-slate-100 mb-1">
                    3,214+
                  </div>
                  <div className="text-sm text-slate-400">Cooldowns Triggered</div>
                </div>

                {/* Stat 3 - Spans both columns */}
                <div className="col-span-2 pt-4 border-t border-white/10">
                  <div className="text-3xl lg:text-4xl font-bold text-slate-100 mb-1">
                    8,932+
                  </div>
                  <div className="text-sm text-slate-400">Sessions Reviewed</div>
                </div>
              </div>

              {/* Pulse Indicator */}
              <div className="mt-6 flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                </div>
                <span className="text-xs text-slate-400">Active traders: 142</span>
              </div>
            </div>

            {/* Decorative Glow */}
            <div
              className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-blue-500/10 blur-3xl -z-10"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
