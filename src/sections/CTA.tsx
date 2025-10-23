import React from "react";
import Button from "../shared/Button";

export default function CTA(){
  return (
    <section className="relative py-16">
      <div className="container">
        <div className="glass p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-2xl md:text-3xl font-semibold">Make consistency your edge.</h3>
            <p className="mt-2 text-slate-300">Install guardrails, remove noise, and let RAimond keep you honest.</p>
          </div>
          \
<Button emailTo="support@raimondai.com" size="lg" variant="primary">Join the Beta</Button>
        </div>
      </div>
    </section>
  );
}