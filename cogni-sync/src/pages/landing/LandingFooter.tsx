import React from 'react';
import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <>
      <style>{`
        .landing-footer {
          background: #070b14;
          border-top: 1px solid rgba(99, 102, 241, 0.1);
          padding: clamp(48px, 8vw, 80px) clamp(20px, 5vw, 48px) clamp(24px, 4vw, 40px);
        }

        .landing-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .landing-footer-top {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 48px;
          align-items: start;
          margin-bottom: 48px;
        }

        @media (max-width: 640px) {
          .landing-footer-top {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        .landing-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 12px;
        }

        .landing-footer-logo {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.35);
          flex-shrink: 0;
        }

        .landing-footer-wordmark {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #f0f4ff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .landing-footer-tagline {
          font-size: 0.875rem;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }

        .landing-footer-nav {
          display: flex;
          gap: 48px;
          flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .landing-footer-nav {
            gap: 32px;
          }
        }

        .landing-footer-nav-group h4 {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #475569;
          margin: 0 0 14px;
        }

        .landing-footer-nav-group ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .landing-footer-link {
          font-size: 0.875rem;
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .landing-footer-link:hover {
          color: #a5b4fc;
        }

        .landing-footer-divider {
          height: 1px;
          background: rgba(99, 102, 241, 0.08);
          margin-bottom: 24px;
        }

        .landing-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .landing-footer-copyright {
          font-size: 0.8rem;
          color: #334155;
          margin: 0;
        }

        .landing-footer-legal {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .landing-footer-legal-link {
          font-size: 0.8rem;
          color: #334155;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .landing-footer-legal-link:hover {
          color: #64748b;
        }
      `}</style>

      <footer className="landing-footer" role="contentinfo">
        <div className="landing-footer-inner">
          <div className="landing-footer-top">
            <div>
              <Link to="/" className="landing-footer-brand" aria-label="CogniSync home">
                <div className="landing-footer-logo" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                  </svg>
                </div>
                <span className="landing-footer-wordmark">CogniSync</span>
              </Link>
              <p className="landing-footer-tagline">AI-powered study tools for every mind</p>
            </div>

            <nav className="landing-footer-nav" aria-label="Footer navigation">
              <div className="landing-footer-nav-group">
                <h4>Navigation</h4>
                <ul>
                  <li><Link to="/" className="landing-footer-link">Home</Link></li>
                  <li><Link to="/app" className="landing-footer-link">App</Link></li>
                  <li><a href="#how-it-works" className="landing-footer-link">How It Works</a></li>
                  <li><a href="#pricing" className="landing-footer-link">Pricing</a></li>
                </ul>
              </div>

              <div className="landing-footer-nav-group">
                <h4>Connect</h4>
                <ul>
                  <li>
                    <a
                      href="https://github.com/Krishnaongith/CogniSync"
                      className="landing-footer-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          <div className="landing-footer-divider" aria-hidden="true" />

          <div className="landing-footer-bottom">
            <p className="landing-footer-copyright">© 2026 CogniSync. All rights reserved.</p>
            <div className="landing-footer-legal">
              <Link to="/privacy" className="landing-footer-legal-link">Privacy Policy</Link>
              <Link to="/terms" className="landing-footer-legal-link">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
