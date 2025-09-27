"use client";

import { useRef, useEffect } from "react";

const COLORS = [
  "rgba(56, 189, 248, 0.25)", // soft sky blue
  "rgba(14, 165, 233, 0.18)", // deeper blue
];

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let resizeRaf = 0;
    let running = true;
    const state = { w: 0, h: 0, dpr: 1 };

    const setCanvasSize = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
      const w = window.innerWidth;
      const h = Math.max(Math.floor(window.innerHeight * 0.35), 180);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      state.w = w;
      state.h = h;
      state.dpr = dpr;
    };

    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(setCanvasSize);
    };

    const animate = (t: number) => {
      if (!running || !canvas || !ctx) return;
      const { w, h } = state;

      ctx.clearRect(0, 0, w, h);

      // --- draw two flowing waves ---
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        const waveHeight = 20 + i * 12;
        const yOffset = h * 0.6 + Math.sin(t * 0.0006 + i) * 10;

        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const y =
            Math.sin(x * 0.006 + t * 0.00033 + i) * waveHeight +
            yOffset +
            Math.cos(x * 0.004 + t * 0.0005 + i * 2) * (6 + i * 4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = COLORS[i];
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = requestAnimationFrame(animate);
      }
    };

    setCanvasSize();
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* flowing blue/pink glow */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 blur-3xl"
        style={{
          background:
            "linear-gradient(270deg, rgba(56,189,248,0.35), rgba(236,72,153,0.35), rgba(56,189,248,0.35))",
          backgroundSize: "200% 200%",
          animation: "flow 16s linear infinite",
        }}
      />
      {/* animated waves */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "35vh",
        }}
      />
    </div>
  );
}
