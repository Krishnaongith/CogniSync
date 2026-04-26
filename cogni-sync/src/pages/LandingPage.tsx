import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from './landing/HeroSection';
import { HowItWorksSection } from './landing/HowItWorksSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { StatsSection } from './landing/StatsSection';
import { ProfilesSection } from './landing/ProfilesSection';
import { PricingSection } from './landing/PricingSection';
import { LandingFooter } from './landing/LandingFooter';

function LandingNav() {
  return (
    <>
      <style>{`
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px clamp(20px, 5vw, 48px);
          background: rgba(7, 11, 20, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }

        .landing-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .landing-nav-logo {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.35);
          flex-shrink: 0;
        }

        .landing-nav-wordmark {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #f0f4ff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .landing-nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 700;
          font-family: inherit;
          padding: 9px 20px;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .landing-nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 28px rgba(99, 102, 241, 0.5);
        }
      `}</style>
      <nav className="landing-nav" aria-label="Main navigation">
        <Link to="/" className="landing-nav-brand" aria-label="CogniSync home">
          <div className="landing-nav-logo" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <span className="landing-nav-wordmark">CogniSync</span>
        </Link>
        <Link to="/app" className="landing-nav-cta">
          Try It Free
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </nav>
    </>
  );
}

export function LandingPage() {
  return (
    <div>
      <LandingNav />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <ProfilesSection />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}
