import React from "react";

export default function CoachStrip(){
  return (
    <section className="relative">
      <div className="container py-10 md:py-12">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="card">
            <h4>Over-confidence guardrails</h4>
            <p>RAImond helps temper confidence after strong runs by introducing calm pacing prompts and trade-size reminders, keeping momentum disciplined instead of emotional.</p>
          </div>
          <div className="card">
            <h4>Revenge trading breaker</h4>
            <p>When frustration builds, RAImond guides you into structured cool-down periods — reducing risk, re-centering focus, and re-establishing a neutral mindset before you re-engage the market.</p>
          </div>
          <div className="card">
            <h4>Accountability timers & check-ins</h4>
            <p>Daily rituals, end-of-session reflections, and guided micro-reviews build structure into your process — creating consistency through routine, not just motivation.</p>
          </div>
        </div>
      </div>
    </section>
  );
}