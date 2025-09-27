"use client";

import { useRef, useEffect } from "react";

/**
 * Subtle two-wave animated background anchored to bottom 35vh of viewport.
 * Colors tuned for calming Sui-like tones.
 */
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

    let animationId: number;

    function setCanvasSize() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || Math.max(window.innerHeight * 0.35, 180);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      (canvas as any)._logicalWidth = width;
      (canvas as any)._logicalHeight = height;
    }

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    function animate(time: number) {
      if (!canvas || !ctx) return;
      const width = (canvas as any)._logicalWidth || canvas.clientWidth;
      const height = (canvas as any)._logicalHeight || canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.beginPath();

        const waveHeight = 20 + i * 12;
        const yOffset = height * 0.6 + Math.sin(time * 0.0006 + i) * 10;

        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const y =
            Math.sin(x * 0.006 + time * 0.00033 + i) * waveHeight +
            yOffset +
            Math.cos(x * 0.004 + time * 0.0005 + i * 2) * (6 + i * 4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        ctx.fillStyle = COLORS[i];
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none z-0"
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100%",
        height: "35vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
