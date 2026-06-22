import React from 'react';
import { useGsapReveal, useGsapHeading } from '../../hooks/useGsapReveal';

const STATS = [
  { value: '40%', label: 'Less Cognitive Load' },
  { value: '4',   label: 'Learning Profiles' },
  { value: '< 5s', label: 'Processing Time' },
  { value: '100%', label: 'Private & Local' },
];

const TESTIMONIALS = [
  {
    quote: 'CogniSync helped me finally understand my biology textbook. The ADHD mode breaks everything into bite-sized chunks.',
    name: 'Alex M.',
    role: 'Undergraduate Student',
    initials: 'AM',
    color: '#6366f1',
  },
  {
    quote: 'I use it every week to prep for exams. The priority matrix tells me exactly what to focus on.',
    name: 'Jordan T.',
    role: 'Graduate Student',
    initials: 'JT',
    color: '#8b5cf6',
  },
  {
    quote: 'As someone with dyslexia, the wider spacing and simplified language makes a huge difference.',
    name: 'Sam R.',
    role: 'Community College Student',
    initials: 'SR',
    color: '#06b6d4',
  },
];

export function StatsSection() {
  const statsRef = useGsapReveal(0.1);
  const headingRef = useGsapHeading();
  const testimonialsRef = useGsapReveal(0.12);

  return (
    <>
      <style>{`
        .stats-section {
          padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 48px);
          background: #0d1424;
          position: relative;
        }

        .stats-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
        }

        .stats-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 80px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .stat-card {
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.12);
          border-radius: 16px;
          padding: 28px 20px;
          text-align: center;
          backdrop-filter: blur(20px);
        }

        .stat-value {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #f0f4ff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 6px;
          line-height: 1.1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .testimonials-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #06b6d4;
          margin-bottom: 12px;
        }

        .testimonials-heading {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #f0f4ff;
          margin: 0 0 40px;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 900px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }

        .testimonial-card {
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: 16px;
          padding: 28px 24px;
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }

        .testimonial-card:hover {
          border-color: rgba(99, 102, 241, 0.25);
          transform: translateY(-3px);
        }

        .testimonial-quote-icon {
          color: rgba(99, 102, 241, 0.3);
          flex-shrink: 0;
        }

        .testimonial-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #94a3b8;
          margin: 0;
          flex: 1;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .testimonial-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .testimonial-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #f0f4ff;
          margin: 0 0 2px;
        }

        .testimonial-role {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }
      `}</style>

      <section className="stats-section" aria-labelledby="stats-heading">
        <div className="stats-inner">
          <div className="stats-grid" role="list" aria-label="Key statistics" ref={statsRef}>
            {STATS.map((stat) => (
              <div key={stat.label} className="stat-card" role="listitem" data-reveal>
                <div className="stat-value" aria-label={`${stat.value} ${stat.label}`}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <span className="testimonials-label">Testimonials</span>
          <h2 id="stats-heading" className="testimonials-heading" ref={headingRef as React.RefObject<HTMLHeadingElement>}>What students are saying</h2>

          <div className="testimonials-grid" ref={testimonialsRef}>
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="testimonial-card" data-reveal>
                <svg className="testimonial-quote-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <blockquote>
                  <p className="testimonial-text">{t.quote}</p>
                </blockquote>
                <figcaption className="testimonial-author">
                  <div
                    className="testimonial-avatar"
                    aria-hidden="true"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
