import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { AdaptationProfileSelector } from './AdaptationProfileSelector';
import { ReadingModeToggle } from './ReadingModeToggle';
import { DocumentIngestion } from './DocumentIngestion';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 3;

const STEP_TITLES = [
  'Welcome to CogniSync — let\'s set up your profile',
  'How do you prefer to read?',
  'Try it now',
];

const STEP_TITLE_IDS = [
  'onboarding-title-1',
  'onboarding-title-2',
  'onboarding-title-3',
];

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0); // 0-indexed
  const { adaptationProfile, setAdaptationProfile, readingMode, setReadingMode, submitDocument } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const isLastStep = step === TOTAL_STEPS - 1;

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Focus first focusable element on step change
    const focusable = modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    if (focusable.length > 0) focusable[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusableEls = Array.from(
        modal!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter(el => !el.closest('[aria-hidden="true"]'));

      if (focusableEls.length === 0) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step]);

  function advance() {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  }

  function skip() {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  }

  return (
    <>
      <style>{`
        .onboarding-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(7, 11, 20, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: fadeIn 0.25s ease;
        }

        .onboarding-modal {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: var(--glass-bg, rgba(17, 24, 39, 0.7));
          border: 1px solid var(--glass-border, rgba(99, 102, 241, 0.12));
          border-radius: 20px;
          box-shadow: var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.4)), 0 0 0 1px rgba(99,102,241,0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 32px;
          animation: scaleIn 0.3s var(--ease-spring, cubic-bezier(0.16,1,0.3,1));
          overflow: hidden;
        }

        .onboarding-modal::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .onboarding-step-indicators {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 28px;
        }

        .onboarding-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all 0.25s ease;
          background: rgba(99,102,241,0.2);
          border: 1px solid rgba(99,102,241,0.2);
        }

        .onboarding-dot.active {
          width: 24px;
          border-radius: 4px;
          background: linear-gradient(90deg, #6366f1, #7c3aed);
          border-color: transparent;
          box-shadow: 0 0 10px rgba(99,102,241,0.4);
        }

        .onboarding-dot.done {
          background: rgba(99,102,241,0.5);
          border-color: rgba(99,102,241,0.4);
        }

        .onboarding-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary, #f0f4ff);
          margin: 0 0 8px;
          line-height: 1.3;
          text-align: center;
        }

        .onboarding-step-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-tertiary, #64748b);
          text-align: center;
          margin-bottom: 24px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .onboarding-content {
          margin-bottom: 28px;
          min-height: 120px;
        }

        .onboarding-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .onboarding-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          transition: opacity 0.15s, box-shadow 0.15s, transform 0.15s;
          min-height: 44px;
        }
        .onboarding-btn-primary:hover {
          box-shadow: 0 6px 24px rgba(99,102,241,0.5);
          transform: translateY(-1px);
        }
        .onboarding-btn-primary:focus-visible {
          outline: 2px solid rgba(99,102,241,0.7);
          outline-offset: 2px;
        }

        .onboarding-btn-ghost {
          display: inline-flex;
          align-items: center;
          padding: 11px 18px;
          background: transparent;
          color: var(--text-tertiary, #64748b);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
          min-height: 44px;
        }
        .onboarding-btn-ghost:hover {
          color: var(--text-secondary, #94a3b8);
          border-color: rgba(99,102,241,0.25);
          background: rgba(99,102,241,0.05);
        }
        .onboarding-btn-ghost:focus-visible {
          outline: 2px solid rgba(99,102,241,0.5);
          outline-offset: 2px;
        }

        .onboarding-sample-hint {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--text-secondary, #94a3b8);
          line-height: 1.5;
        }
      `}</style>

      <div className="onboarding-overlay">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={STEP_TITLE_IDS[step]}
          className="onboarding-modal"
        >
          {/* Step indicators */}
          <div className="onboarding-step-indicators" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`onboarding-dot${i === step ? ' active' : i < step ? ' done' : ''}`}
              />
            ))}
          </div>

          {/* Step counter (screen reader) */}
          <p className="onboarding-step-label" aria-live="polite">
            Step {step + 1} of {TOTAL_STEPS}
          </p>

          {/* Title */}
          <h2 id={STEP_TITLE_IDS[step]} className="onboarding-title">
            {STEP_TITLES[step]}
          </h2>

          {/* Step content */}
          <div className="onboarding-content">
            {step === 0 && (
              <AdaptationProfileSelector
                selected={adaptationProfile}
                hasDocument={false}
                isLoading={false}
                onChange={setAdaptationProfile}
                onReprocess={() => {}}
              />
            )}

            {step === 1 && (
              <ReadingModeToggle
                mode={readingMode.mode}
                onSwitch={() =>
                  setReadingMode(readingMode.mode === 'focus' ? 'step-by-step' : 'focus')
                }
              />
            )}

            {step === 2 && (
              <>
                <div className="onboarding-sample-hint">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Upload a document below to try it out!
                </div>
                <DocumentIngestion
                  onSubmit={(text) => { onComplete(); submitDocument(text); }}
                  isLoading={false}
                />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="onboarding-actions">
            <button className="onboarding-btn-ghost" onClick={skip}>
              Skip
            </button>
            <button className="onboarding-btn-primary" onClick={advance}>
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
