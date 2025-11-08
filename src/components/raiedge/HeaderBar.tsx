"use client";
import React from "react";
import { useRaiEdgeData } from "@/lib/raiedge/useRaiEdgeData";
import ConnectionsMenu from "@/components/raiedge/ConnectionsMenu";

export default function HeaderBar(){
  const { state, actions } = useRaiEdgeData();
  const pill =
    state.edgeStatus==="stable" ? "bg-emerald-500/20 text-emerald-300"
    : state.edgeStatus==="expanding" ? "bg-indigo-500/20 text-indigo-300"
    : "bg-[color:var(--accent)]/15 text-[color:var(--accent)]";

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-surface/80">
      <div className="mx-auto max-w-8xl px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            {/* If you add /public/brand/raimond.svg it will render; otherwise fallback text appears */}
            <img src="/logo.svg" alt="RAimond" width="28" height="28" />
          </div>
          <div className="text-2xl font-bold tracking-wide text-brand">RAimond</div>
          <span className={"pill " + pill}>Edge Status: {state.edgeStatus}</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <span>P&amp;L: <strong className={(state.session.pnl>=0)?"text-emerald-300":"text-rose-300"}>${state.session.pnl}</strong></span>
          <span>Win rate: {(state.session.winRate*100).toFixed(0)}%</span>
          <span>Time in market: {state.session.timeInMarketMin}m</span>
          <span>Trades: {state.session.tradesToday}</span>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionsMenu />
          <button onClick={actions.toggleDiscipline} className={"text-sm btn " + (state.discipline.enabled?"bg-[color:var(--accent)]/20 text-[color:var(--accent)]":"")}>
            Discipline Mode
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border border-white/10" />
        </div>
      </div>
    </header>
  );
}
