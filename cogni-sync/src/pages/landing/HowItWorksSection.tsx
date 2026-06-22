import React from 'react';
import { useGsapReveal, useGsapHeading } from '../../hooks/useGsapReveal';

const STEPS = [
  {
    number: '01',
    title: 'Upload Your Document',
    description: 'Drop in a PDF, Word doc, PowerPoint, or paste raw text. CogniSync handles any academic format up to 100 MB.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Choose Your Profile',
    description: 'Select Default, ADHD, Dyslexia, or Anxiety mode. Each profile adjusts typography, chunk size, and tone to match how your brain works best.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Get Simplified Output',
    description: 'Receive key points, a plain-language summary, and a prioritized task list in under 5 seconds, ready to study, annotate, or export.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3c-1 3-4 4-4 8a4 4 0 0 0 8 0c0-4-3-5-4-8z"/>
        <path d="M12 21v-6"/>
        <path d="M9 18h6"/>
        <circle cx="12" cy="11" r="1" fill="currentColor"/>
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  const headingRef = useGsapHeading();
  const cardsRef = useGsapReveal(0.15);

  return (
    <>
      <style>{`
        .hiw-section {
          padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 48px);
          background: #0d1424;
          position: relative;
          overflow: hidden;
        }

        .hiw-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
        }

        .hiw-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .hiw-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #06b6d4;
          margin-bottom: 12px;
        }

        .hiw-heading {
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #f0f4ff;
          margin: 0 0 16px;
        }

        .hiw-subtext {
          font-size: 1.05rem;
          color: #64748b;
          max-width: 520px;
          line-height: 1.65;
          margin: 0 0 64px;
        }

        .hiw-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          position: relative;
        }

        .hiw-steps::before {
          content: '';
          position: absolute;
          top: 52px;
          left: calc(16.66% + 16px);
          right: calc(16.66% + 16px);
          height: 1px;
          background: linear-gradient(90deg, rgba(99,102,241,0.4), rgba(6,182,212,0.4));
          z-index: 0;
        }

        @media (max-width: 768px) {
          .hiw-steps {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .hiw-steps::before { display: none; }
        }

        .hiw-step {
          position: relative;
          z-index: 1;
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.12);
          border-radius: 16px;
          padding: 32px 28px;
          backdrop-filter: blur(20px);
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }

        .hiw-step:hover {
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.15);
        }

        .hiw-step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          margin-bottom: 20px;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }

        .hiw-step-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
          margin-bottom: 20px;
        }

        .hiw-step-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f0f4ff;
          margin: 0 0 10px;
        }

        .hiw-step-desc {
          font-size: 0.9rem;
          line-height: 1.65;
          color: #64748b;
          margin: 0;
        }
      `}</style>

      <section id="how-it-works" className="hiw-section" aria-labelledby="hiw-heading">
        <div className="hiw-inner">
          <span className="hiw-label">How It Works</span>
          <h2 id="hiw-heading" className="hiw-heading" ref={headingRef as React.RefObject<HTMLHeadingElement>}>Three steps to clarity</h2>
          <p className="hiw-subtext">
            From raw document to actionable insights in seconds, no setup, no learning curve.
          </p>

          <div className="hiw-steps" ref={cardsRef}>
            {STEPS.map((step) => (
              <div key={step.number} className="hiw-step" data-reveal>
                <div className="hiw-step-number" aria-hidden="true">{step.number}</div>
                <div className="hiw-step-icon" aria-hidden="true">{step.icon}</div>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
