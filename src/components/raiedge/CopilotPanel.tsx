"use client";
import React, { useState, useEffect } from "react";
import { useRaiEdgeData } from "@/lib/raiedge/useRaiEdgeData";
import { useVoiceAgent } from "@/lib/raiedge/useVoiceAgent";
import VoiceControls from "@/components/raiedge/VoiceControls";

export default function CopilotPanel(){
  const { state, actions } = useRaiEdgeData();
  const [input, setInput] = useState("");
  const [showVC, setShowVC] = useState(false);
  const voice = useVoiceAgent();

  useEffect(()=>{
    // On voice phrase end, push message + speak reply if enabled
    if (!voice.listening && voice.transcript){
      const heard = voice.transcript;
      actions.postUserMessage(heard);
      setTimeout(()=>{
        const reply = `Heard: "${heard}". Next: confirm bias, check VWAP bands, wait for delta flip.`;
        voice.speak(reply);
        actions.postUserMessage(`[RAi reply] ${reply}`);
      }, 250);
    }
  }, [voice.listening]);

  return (
    <section className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">RAimond Copilot</div>
          <div className="flex items-center gap-3">
            {voice.available ? (
              <button onClick={()=> voice.listening ? voice.stop() : voice.start()}
                title="Mic"
                className={"w-9 h-9 rounded-full ring-brand " + (voice.listening ? "bg-[color:var(--accent-2)]/25 animate-pulse" : "bg-white/5 hover:bg-white/10")}>
                🎙️
              </button>
            ) : (
              <span className="pill bg-white/10 text-muted">Voice unavailable</span>
            )}
            <button onClick={()=>setShowVC(v=>!v)} className="btn" title="Voice settings">⚙️</button>
            <span className={"pill " + (state.discipline.enabled ? "bg-[color:var(--accent)]/20 text-[color:var(--accent)]":"bg-white/10 text-muted")}>
              Max Loss: ${state.discipline.maxDailyLoss}
            </span>
          </div>
        </div>

        {voice.listening && (
          <div className="mt-2 text-xs text-[color:var(--accent-2)]/90">Listening… {voice.transcript}</div>
        )}

        <div className="mt-4 h-64 overflow-y-auto space-y-2">
          {state.messages.map((m, idx) => (
            <div key={idx} className={"text-sm " + (m.role==="assistant" ? "text-[color:var(--accent)]":"text-brand")}>{m.role==="assistant"?"RAi:":"You:"} {m.text}</div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask RAi or journal a note…"
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-brand placeholder:text-muted" />
          <button onClick={()=>{ if(input.trim()) { actions.postUserMessage(input.trim()); setInput(""); }}} className="btn">Send</button>
        </div>
      </div>

      {showVC && (
        <div className="fixed top-20 right-6 z-50">
          <VoiceControls />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Metric title="Cumulative Delta" value={state.orderFlow.cumulativeDelta.toString()} />
        <Metric title="VWAP" value={state.orderFlow.vwap.toFixed(2)} />
        <Metric title="POC" value={state.orderFlow.pocPrice.toFixed(2)} />
      </div>
    </section>
  );
}

function Metric({title,value}:{title:string; value:string}){
  return (
    <div className="card">
      <div className="text-xs text-muted">{title}</div>
      <div className="mt-1 text-xl">{value}</div>
    </div>
  );
}
