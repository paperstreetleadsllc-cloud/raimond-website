import React, { useState } from "react";
import HudCanvas from "../shared/HudCanvas";
import BetaModal from "../shared/BetaModal"; // if you added earlier; harmless if not used

export default function Hero(){
  const [open,setOpen] = useState(false);

  return (
    <section className="relative hud-grid scanlines overflow-hidden">
      <div className="container section-pad relative z-10 grid grid-cols-12 gap-10 items-center">
        {/* Copy column */}
        <div className="col-span-12 lg:col-span-6">
          <div className="chip mb-5"><span className="chip-dot" /> Adaptive Trading Assistant</div>
          <h1 className="text-white font-display text-4xl md:text-7xl lg:text-8xl leading-[0.95] max-w-3xl">
  Meet <span className="text-[var(--accent)]">RAI</span>mond Ã¢â‚¬â€ your accountability co-pilot
</h1>
          <p className="lede mt-5 max-w-[62ch]">
            RAimond watches over your sessions like a desk coachÃ¢â‚¬â€learning your patterns, 
            flagging over-confidence and revenge trades, reinforcing discipline, and giving timed reminders. 
            It finds inefficiencies and prescribes fixes, so you trade like the <em>house</em>, not the crowd.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-lg btn-accent" href="#features">See capabilities</a>
            <button className="btn btn-lg btn-ghost" onClick={()=>setOpen(true)}>Join the beta</button>
            {/* Fallback: <a className="btn btn-lg btn-ghost" href="mailto:support@raimondai.com?subject=Join%20the%20RAimond%20beta">Join the beta</a> */}
          </div>

          <div className="mt-8 hr-glow" />
          <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-sm text-slate-300">
            <li className="chip">Live voice nudges</li>
            <li className="chip">Daily lockouts & cooldowns</li>
            <li className="chip">Journal + analytics</li>
          </ul>
        </div>

        {/* HUD column */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass relative w-full max-w-[620px] h-[420px] md:h-[520px] mx-auto">
            <HudCanvas className="absolute inset-0 rounded-[20px]" />
          </div>
        </div>
      </div>

      {open && <BetaModal open={open} onClose={()=>setOpen(false)} />}
    </section>
  );
}