import React, {useRef, useEffect} from "react";

/** Futuristic HUD canvas: pulsing rings + floating particles */
export default function HudCanvas({ className = "" }: { className?: string }){
  const ref = useRef<HTMLCanvasElement|null>(null);

  useEffect(()=>{
    const c = ref.current!; if(!c) return;
    const ctx = c.getContext("2d")!; const DPR = Math.max(1, window.devicePixelRatio || 1);
    let raf = 0, t = 0;

    function resize(){
      c.width = Math.floor(c.clientWidth * DPR);
      c.height = Math.floor(c.clientHeight * DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }

    const P = Array.from({length: 110}).map(()=>({
      x: Math.random(), y: Math.random(), z: Math.random()*0.8+0.2, v:(Math.random()*0.4+0.2)
    }));

    function draw(){
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0,0,w,h);

      // soft bg vignette
      const g = ctx.createRadialGradient(w*0.55,h*0.4,0, w*0.55,h*0.4, Math.max(w,h)*0.7);
      g.addColorStop(0,"rgba(10,30,50,.25)");
      g.addColorStop(1,"rgba(10,20,38,.05)");
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

      // particles
      for(const p of P){
        const px = p.x*w, py = (p.y + Math.sin((p.x*2+t)*0.5)*0.002)*h;
        const s = (p.z*2+0.3);
        ctx.globalAlpha = 0.55*p.z;
        ctx.fillStyle = "rgba(31, 240, 218, .85)";
        ctx.fillRect(px, py, s, s*4);
        p.x += 0.0006*p.v; if(p.x>1) p.x = 0;
      }
      ctx.globalAlpha = 1;

      // concentric rings
      const cx = w*0.52, cy=h*0.42;
      for(let i=0;i<4;i++){
        const r = 70 + i*48 + Math.sin(t*0.9+i)*6;
        ctx.beginPath();
        ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle = `rgba(126,241,228,${0.26 - i*0.04})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // rotating sweep
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(t*0.7);
      ctx.beginPath();
      ctx.ellipse(0,0, 120, 34, 0, 0, Math.PI*2);
      ctx.strokeStyle = "rgba(25,224,200,.35)";
      ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();

      t+=0.02;
      raf = requestAnimationFrame(draw);
    }

    resize(); window.addEventListener("resize", resize, {passive:true});
    raf = requestAnimationFrame(draw);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  },[]);

  return <canvas ref={ref} className={className} style={{width:"100%",height:"100%",display:"block"}}/>;
}