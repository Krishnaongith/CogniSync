import React from 'react';
import { useGsapReveal, useGsapHeading } from '../../hooks/useGsapReveal';
import { Link } from 'react-router-dom';

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: { label: string; href?: string; to?: string };
  highlighted: boolean;
  badge?: string;
}

const TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started with the essentials, no credit card required.',
    features: [
      '5 documents per month',
      'Basic cognitive profiles',
      'Standard simplification',
      'Key points & task list',
      'Session history (last 5)',
    ],
    cta: { label: 'Start for Free', to: '/app' },
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'Everything you need for serious studying, unlimited.',
    features: [
      'Unlimited documents',
      'All 4 cognitive profiles',
      'Complexity dial (K–Graduate)',
      'Sentence complexity heatmap',
      'Glossary & jargon definitions',
      'Annotations & highlights',
      'Calendar export',
      'Weekly digest',
    ],
    cta: { label: 'Get Started', to: '/app' },
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Institution',
    price: 'Custom',
    description: 'Built for universities, colleges, and learning centers.',
    features: [
      'Everything in Pro',
      'LMS integration',
      'Bulk document processing',
      'Admin dashboard',
      'Priority support',
      'Custom onboarding',
    ],
    cta: { label: 'Contact Us', href: 'mailto:helpcognisync@gmail.com' },
    highlighted: false,
  },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export function PricingSection() {
  const headingRef = useGsapHeading();
  const cardsRef = useGsapReveal(0.15);

  return (
    <>
      <style>{`
        .pricing-section {
          padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 48px);
          background: #0d1424;
          position: relative;
        }

        .pricing-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
        }

        .pricing-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .pricing-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 12px;
        }

        .pricing-heading {
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #f0f4ff;
          margin: 0 0 16px;
        }

        .pricing-subtext {
          font-size: 1.05rem;
          color: #64748b;
          max-width: 480px;
          line-height: 1.65;
          margin: 0 0 56px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 480px;
          }
        }

        .pricing-card {
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.12);
          border-radius: 20px;
          padding: 32px 28px;
          backdrop-filter: blur(20px);
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
        }

        .pricing-card--highlighted {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(99, 102, 241, 0.06);
          box-shadow: 0 0 40px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.3);
        }

        .pricing-card--highlighted:hover {
          box-shadow: 0 0 60px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.4);
        }

        .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 14px;
          border-radius: 9999px;
          white-space: nowrap;
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
        }

        .pricing-tier-name {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
          margin: 0 0 12px;
        }

        .pricing-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }

        .pricing-price-value {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #f0f4ff;
          line-height: 1;
        }

        .pricing-price-period {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }

        .pricing-description {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 24px;
        }

        .pricing-divider {
          height: 1px;
          background: rgba(99, 102, 241, 0.1);
          margin-bottom: 24px;
        }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pricing-feature {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.875rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .pricing-feature-check {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .pricing-cta-primary {
          display: block;
          width: 100%;
          text-align: center;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          padding: 13px 24px;
          border-radius: 10px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .pricing-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
        }

        .pricing-cta-ghost {
          display: block;
          width: 100%;
          text-align: center;
          background: transparent;
          color: #818cf8;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: inherit;
          padding: 13px 24px;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid rgba(99, 102, 241, 0.25);
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .pricing-cta-ghost:hover {
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
        }
      `}</style>

      <section id="pricing" className="pricing-section" aria-labelledby="pricing-heading">
        <div className="pricing-inner">
          <span className="pricing-label">Pricing</span>
          <h2 id="pricing-heading" className="pricing-heading" ref={headingRef as React.RefObject<HTMLHeadingElement>}>Simple, transparent pricing</h2>
          <p className="pricing-subtext">
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>

          <div className="pricing-grid" ref={cardsRef}>
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`pricing-card${tier.highlighted ? ' pricing-card--highlighted' : ''}`}
                data-reveal
              >
                {tier.badge && (
                  <div className="pricing-badge" aria-label="Most popular plan">{tier.badge}</div>
                )}

                <p className="pricing-tier-name">{tier.name}</p>

                <div className="pricing-price">
                  <span className="pricing-price-value">{tier.price}</span>
                  {tier.period && <span className="pricing-price-period">{tier.period}</span>}
                </div>

                <p className="pricing-description">{tier.description}</p>

                <div className="pricing-divider" aria-hidden="true" />

                <ul className="pricing-features" aria-label={`${tier.name} plan features`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="pricing-feature">
                      <span className="pricing-feature-check"><CheckIcon /></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier.cta.to ? (
                  <Link
                    to={tier.cta.to}
                    className={tier.highlighted ? 'pricing-cta-primary' : 'pricing-cta-ghost'}
                  >
                    {tier.cta.label}
                  </Link>
                ) : (
                  <a
                    href={tier.cta.href}
                    className="pricing-cta-ghost"
                  >
                    {tier.cta.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
