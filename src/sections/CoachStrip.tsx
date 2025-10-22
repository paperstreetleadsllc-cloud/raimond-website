import React from "react";

export default function CoachStrip(){
  return (
    <section className="relative">
      <div className="container py-10 md:py-12">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="card">
            <h4>Over-confidence guardrails</h4>
            <p>Dynamic size caps and pacing prompts kick in when you’re hot—so momentum doesn’t
            drift into risk drift.</p>
          </div>
          <div className="card">
            <h4>Revenge trading breaker</h4>
            <p>After losses, RAimond enters a cooldown state and switches to low-risk modes with
            calm voice cues and timeboxed resets.</p>
          </div>
          <div className="card">
            <h4>Accountability timers & check-ins</h4>
            <p>Session start rituals, end-of-day audits, and micro-reviews create consistency 
            without relying on willpower alone.</p>
          </div>
        </div>
      </div>
    </section>
  );
}