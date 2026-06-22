import React from 'react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes heroGradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-section::before {
            animation: none !important;
          }
        }

        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(135deg, #0d1424 0%, #1a1040 35%, #0d2040 65%, #071420 100%);
        }

        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            -45deg,
            #0d1424,
            #1e1b4b,
            #312e81,
            #1e3a5f,
            #0e4a5a,
            #0d1424
          );
          background-size: 400% 400%;
          animation: heroGradientShift 12s ease infinite;
          z-index: 0;
        }

        .hero-section::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 20% 30%, rgba(99, 102, 241, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(6, 182, 212, 0.2) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 60% 10%, rgba(168, 85, 247, 0.18) 0%, transparent 50%);
          z-index: 1;
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          max-width: 860px;
          margin: 0 auto;
          padding: clamp(80px, 12vw, 140px) clamp(20px, 5vw, 48px) clamp(60px, 8vw, 100px);
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 9999px;
          padding: 6px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #a5b4fc;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .hero-headline {
          font-size: clamp(2rem, 5.5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #f0f4ff;
          margin: 0 0 24px;
          background: linear-gradient(135deg, #f0f4ff 0%, #c7d2fe 50%, #67e8f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subheadline {
          font-size: clamp(1rem, 2vw, 1.2rem);
          line-height: 1.7;
          color: #94a3b8;
          max-width: 640px;
          margin: 0 auto 44px;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          font-family: inherit;
          padding: 14px 32px;
          border-radius: 10px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.4), 0 4px 16px rgba(0,0,0,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(99, 102, 241, 0.6), 0 8px 24px rgba(0,0,0,0.4);
        }

        .hero-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #a5b4fc;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          padding: 14px 32px;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid rgba(99, 102, 241, 0.3);
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .hero-btn-ghost:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-2px);
        }

        .hero-scroll-hint {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: rgba(148, 163, 184, 0.5);
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        @media (prefers-reduced-motion: no-preference) {
          .hero-scroll-hint svg {
            animation: float 2s ease-in-out infinite;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
      `}</style>

      <section className="hero-section" aria-labelledby="hero-headline">
        <div className="hero-content">
          <div className="hero-badge" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            AI-Powered Study Tool
          </div>

          <h1 id="hero-headline" className="hero-headline">
            Your Brain Works Differently.<br />Your Study Tools Should Too.
          </h1>

          <p className="hero-subheadline">
            Dense academic text causes cognitive overload. CogniSync simplifies any document into clear key points, plain-language summaries, and actionable to-do lists, adapted to your cognitive profile.
          </p>

          <div className="hero-cta-group">
            <Link to="/app" className="hero-btn-primary">
              Try It Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <a href="#how-it-works" className="hero-btn-ghost">
              See How It Works
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </section>
    </>
  );
}
