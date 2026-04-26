import React, { useState } from 'react';
import type { AdaptationProfile } from '../../types';

interface ProfileConfig {
  id: AdaptationProfile;
  label: string;
  color: string;
  traits: { label: string; value: string }[];
  sampleText: string;
  style: React.CSSProperties;
}

const PROFILES: ProfileConfig[] = [
  {
    id: 'default',
    label: 'Default',
    color: '#6366f1',
    traits: [
      { label: 'Chunk size', value: 'Large' },
      { label: 'Spacing', value: 'Standard' },
      { label: 'Tone', value: 'Neutral' },
    ],
    sampleText: 'Mitochondria are membrane-bound organelles found in the cytoplasm of eukaryotic cells. They generate most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy. The process by which mitochondria produce ATP is called cellular respiration.',
    style: { lineHeight: 1.6, fontSize: '15px' },
  },
  {
    id: 'adhd',
    label: 'ADHD',
    color: '#f59e0b',
    traits: [
      { label: 'Chunk size', value: 'Small' },
      { label: 'Spacing', value: 'Extra wide' },
      { label: 'Tone', value: 'Energetic' },
    ],
    sampleText: 'Mitochondria make energy for your cells.\n\nThey\'re found inside almost every cell in your body.\n\nThey turn food into ATP — that\'s the fuel your cells run on.\n\nThis process is called cellular respiration. Pretty cool, right?',
    style: { lineHeight: 2, fontSize: '15px' },
  },
  {
    id: 'dyslexia',
    label: 'Dyslexia',
    color: '#06b6d4',
    traits: [
      { label: 'Chunk size', value: 'Medium' },
      { label: 'Spacing', value: 'Wide letter & word' },
      { label: 'Tone', value: 'Calm' },
    ],
    sampleText: 'Mitochondria are small parts inside your cells. They make energy that your body uses to work. The energy they make is called ATP. The way they make this energy is called cellular respiration.',
    style: { lineHeight: 2, fontSize: '17px', letterSpacing: '0.04em', wordSpacing: '0.1em' },
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    color: '#10b981',
    traits: [
      { label: 'Chunk size', value: 'Medium' },
      { label: 'Spacing', value: 'Relaxed' },
      { label: 'Tone', value: 'Calm & gentle' },
    ],
    sampleText: 'Take your time with this. Mitochondria are simply small structures inside your cells that help create energy. There\'s no rush — they work quietly in the background, converting nutrients into a form your body can use. This energy is called ATP.',
    style: { lineHeight: 2, fontSize: '15px' },
  },
];

export function ProfilesSection() {
  const [selected, setSelected] = useState<AdaptationProfile>('default');

  const activeProfile = PROFILES.find((p) => p.id === selected)!;

  return (
    <>
      <style>{`
        .profiles-section {
          padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 48px);
          background: #070b14;
          position: relative;
        }

        .profiles-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent);
        }

        .profiles-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .profiles-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #10b981;
          margin-bottom: 12px;
        }

        .profiles-heading {
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #f0f4ff;
          margin: 0 0 16px;
        }

        .profiles-subtext {
          font-size: 1.05rem;
          color: #64748b;
          max-width: 520px;
          line-height: 1.65;
          margin: 0 0 48px;
        }

        .profiles-switcher {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .profile-btn {
          padding: 10px 22px;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid rgba(99, 102, 241, 0.2);
          background: transparent;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .profile-btn:hover {
          border-color: rgba(99, 102, 241, 0.4);
          color: #94a3b8;
        }

        .profile-btn[aria-pressed="true"] {
          color: #fff;
          border-color: transparent;
        }

        .profiles-demo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .profiles-demo {
            grid-template-columns: 1fr;
          }
        }

        .profiles-preview {
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(99, 102, 241, 0.12);
          border-radius: 16px;
          padding: 28px 24px;
          backdrop-filter: blur(20px);
        }

        .profiles-preview-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 16px;
        }

        .profiles-preview-text {
          margin: 0;
          color: #e2e8f0;
          white-space: pre-line;
          font-family: inherit;
        }

        .profiles-traits {
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(99, 102, 241, 0.12);
          border-radius: 16px;
          padding: 28px 24px;
          backdrop-filter: blur(20px);
        }

        .profiles-traits-heading {
          font-size: 1rem;
          font-weight: 700;
          color: #f0f4ff;
          margin: 0 0 20px;
        }

        .profile-trait-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(99, 102, 241, 0.08);
        }

        .profile-trait-row:last-child {
          border-bottom: none;
        }

        .profile-trait-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        .profile-trait-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #f0f4ff;
        }
      `}</style>

      <section className="profiles-section" aria-labelledby="profiles-heading">
        <div className="profiles-inner">
          <span className="profiles-label">Cognitive Profiles</span>
          <h2 id="profiles-heading" className="profiles-heading">See the difference each profile makes</h2>
          <p className="profiles-subtext">
            Switch between profiles to see how the same content is adapted for different cognitive needs.
          </p>

          <div className="profiles-switcher" role="group" aria-label="Select cognitive profile">
            {PROFILES.map((profile) => (
              <button
                key={profile.id}
                className="profile-btn"
                aria-pressed={selected === profile.id}
                onClick={() => setSelected(profile.id)}
                style={
                  selected === profile.id
                    ? { background: `linear-gradient(135deg, ${profile.color}, ${profile.color}cc)`, borderColor: 'transparent', color: '#fff' }
                    : {}
                }
              >
                {profile.label}
              </button>
            ))}
          </div>

          <div className="profiles-demo">
            <div className="profiles-preview">
              <p className="profiles-preview-label">Sample paragraph — {activeProfile.label} mode</p>
              <p className="profiles-preview-text" style={activeProfile.style}>
                {activeProfile.sampleText}
              </p>
            </div>

            <div className="profiles-traits">
              <h3 className="profiles-traits-heading" style={{ color: activeProfile.color }}>
                {activeProfile.label} Profile
              </h3>
              {activeProfile.traits.map((trait) => (
                <div key={trait.label} className="profile-trait-row">
                  <span className="profile-trait-label">{trait.label}</span>
                  <span className="profile-trait-value">{trait.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
