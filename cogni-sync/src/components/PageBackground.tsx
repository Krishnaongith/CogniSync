import { useEffect, useRef } from 'react';

export function PageBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${p.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes bgPan {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glow1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(80px,-60px) scale(1.2); }
          66%      { transform: translate(-40px,80px) scale(0.9); }
        }
        @keyframes glow2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-100px,60px) scale(1.15); }
          70%      { transform: translate(60px,-80px) scale(0.85); }
        }
        @keyframes glow3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(60px,100px) scale(1.25); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pbg-gradient, .pbg-glow { animation: none !important; }
        }

        .pbg-root {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .pbg-gradient {
          position: absolute;
          inset: -10%;
          background: linear-gradient(
            -45deg,
            #04060e,
            #0e0a28,
            #060e24,
            #120828,
            #060e1e,
            #04060e
          );
          background-size: 400% 400%;
          animation: bgPan 24s ease infinite;
        }
        .pbg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          will-change: transform;
        }
        .pbg-glow-1 {
          width: 70vw; height: 70vw;
          top: -20%; left: -15%;
          background: radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 65%);
          animation: glow1 20s ease-in-out infinite;
        }
        .pbg-glow-2 {
          width: 55vw; height: 55vw;
          top: 20%; right: -15%;
          background: radial-gradient(circle, rgba(6,182,212,0.38) 0%, transparent 65%);
          animation: glow2 26s ease-in-out infinite;
        }
        .pbg-glow-3 {
          width: 45vw; height: 45vw;
          bottom: -10%; left: 25%;
          background: radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 65%);
          animation: glow3 30s ease-in-out infinite;
        }
        .pbg-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
      <div className="pbg-root" aria-hidden="true">
        <div className="pbg-gradient" />
        <div className="pbg-glow pbg-glow-1" />
        <div className="pbg-glow pbg-glow-2" />
        <div className="pbg-glow pbg-glow-3" />
        <canvas className="pbg-canvas" ref={canvasRef} />
      </div>
    </>
  );
}
