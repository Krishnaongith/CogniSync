import React, { useRef, useState, useEffect } from 'react';
import { IngestionError, SUPPORTED_TYPES, MAX_PASTE_CHARS } from '../types/index';

interface DocumentIngestionProps {
  onSubmit: (input: File | File[] | string) => void;
  isLoading: boolean;
  error?: IngestionError | string;
}

function getErrorMessage(error: IngestionError | string): string {
  if (typeof error === 'string') return error;
  switch (error.code) {
    case 'UNSUPPORTED_TYPE': return 'File type not supported. Upload a PDF, DOCX, PPTX, XLSX, or TXT file.';
    case 'FILE_TOO_LARGE':   return 'File exceeds 100\u00a0MB. Upload a smaller file.';
    case 'EXTRACTION_FAILED': return "Couldn\u2019t extract text. Paste the text directly instead.";
    case 'PASTE_TOO_LONG':   return 'Text exceeds 80,000 characters. Shorten your input.';
    default: return error.message;
  }
}

const PROCESSING_MESSAGES = [
  'Extracting text\u2026',
  'Analyzing structure\u2026',
  'Generating insights\u2026',
  'Finalizing results\u2026',
];

function charCountColor(len: number): string {
  const pct = len / MAX_PASTE_CHARS;
  if (pct > 0.85) return '#ef4444';
  if (pct > 0.60) return '#f59e0b';
  return '#10b981';
}

export function DocumentIngestion({ onSubmit, isLoading, error }: DocumentIngestionProps) {
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [dragOver, setDragOver] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) { setMsgIndex(0); return; }
    const id = setInterval(() => setMsgIndex(i => (i + 1) % PROCESSING_MESSAGES.length), 1500);
    return () => clearInterval(id);
  }, [isLoading]);

  const acceptTypes = SUPPORTED_TYPES.join(',');
  const charPct = pasteText.length / MAX_PASTE_CHARS;
  const barColor = charCountColor(pasteText.length);
  const tabIndex = activeTab === 'file' ? 0 : 1;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length === 1) {
      setSelectedFiles([]);
      onSubmit(files[0]);
    } else {
      const arr = Array.from(files);
      setSelectedFiles(arr);
      onSubmit(arr);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    if (files.length === 1) {
      setSelectedFiles([]);
      onSubmit(files[0]);
    } else {
      const arr = Array.from(files);
      setSelectedFiles(arr);
      onSubmit(arr);
    }
  }

  function handlePasteSubmit() {
    if (!pasteText.trim()) { setValidationError('Please paste some text first.'); return; }
    onSubmit(pasteText);
  }

  function handleDropZoneKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); }
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes msgFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropzonePulse {
          0%, 100% { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 0 rgba(99,102,241,0); }
          50%       { border-color: rgba(99,102,241,0.8); box-shadow: 0 0 0 6px rgba(99,102,241,0.08); }
        }

        .di-tab-btn {
          position: relative; z-index: 1;
          border: none; background: transparent;
          padding: 8px 22px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          border-radius: 999px;
          transition: color 0.2s;
          min-height: 40px;
          white-space: nowrap;
        }

        .di-dropzone {
          border: 1.5px dashed rgba(99,102,241,0.25);
          border-radius: 16px;
          padding: 52px 32px;
          text-align: center;
          cursor: pointer;
          background: rgba(99,102,241,0.03);
          transition: all 0.2s;
          touch-action: manipulation;
          position: relative;
          overflow: hidden;
        }
        .di-dropzone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .di-dropzone:hover::before,
        .di-dropzone:focus-visible::before,
        .di-dropzone.drag-over::before { opacity: 1; }
        .di-dropzone:hover,
        .di-dropzone:focus-visible {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.05);
          outline: none;
        }
        .di-dropzone.drag-over {
          border-color: #6366f1;
          background: rgba(99,102,241,0.08);
          animation: dropzonePulse 1.5s ease-in-out infinite;
        }

        .di-upload-icon {
          width: 64px; height: 64px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1));
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .di-dropzone:hover .di-upload-icon,
        .di-dropzone.drag-over .di-upload-icon {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.25);
        }

        .di-submit-btn {
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
          touch-action: manipulation;
        }
        .di-submit-btn:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(99,102,241,0.5);
          transform: translateY(-1px);
        }
        .di-submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .di-textarea {
          width: 100%;
          padding: 14px 16px;
          font-size: 14px;
          font-family: inherit;
          border-radius: 12px;
          border: 1.5px solid rgba(99,102,241,0.15);
          background: rgba(99,102,241,0.04);
          box-sizing: border-box;
          resize: vertical;
          line-height: 1.65;
          color: var(--text-primary);
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .di-textarea::placeholder { color: var(--text-tertiary); }
        .di-textarea:focus {
          outline: none;
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .di-textarea.error {
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        .di-msg { animation: msgFade 0.3s ease; }

        .di-processing {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 12px;
          margin-top: 16px;
        }

        .di-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Tab switcher */}
        <div style={{ marginBottom: 20 }}>
          <div
            role="tablist"
            aria-label="Input method"
            style={{
              position: 'relative',
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.12)',
              borderRadius: 999,
              padding: 4,
              display: 'inline-flex',
            }}
          >
            {/* Sliding pill */}
            <div aria-hidden="true" style={{
              position: 'absolute',
              top: 4, bottom: 4, left: 4,
              width: 'calc(50% - 4px)',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
              transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
              transform: `translateX(${tabIndex * 100}%)`,
              pointerEvents: 'none',
            }} />
            <button
              role="tab"
              aria-selected={activeTab === 'file'}
              className="di-tab-btn"
              onClick={() => setActiveTab('file')}
              style={{ color: activeTab === 'file' ? '#fff' : 'var(--text-secondary)' }}
            >
              Upload File
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'paste'}
              className="di-tab-btn"
              onClick={() => setActiveTab('paste')}
              style={{ color: activeTab === 'paste' ? '#fff' : 'var(--text-secondary)' }}
            >
              Paste Text
            </button>
          </div>
        </div>

        {/* File upload */}
        {activeTab === 'file' && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a document, click or drag and drop"
            className={`di-dropzone${dragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleDropZoneKeyDown}
          >
            <div className="di-upload-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragOver ? '#818cf8' : '#6366f1'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontWeight: 700, color: dragOver ? '#818cf8' : 'var(--text-primary)', fontSize: 15 }}>
              {dragOver ? 'Release to upload' : 'Drop your document here'}
            </p>
            <p style={{ margin: '6px 0 20px', fontSize: 13, color: 'var(--text-tertiary)' }}>
              or click to browse your files
            </p>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.18)',
              borderRadius: 999,
              padding: '4px 14px',
              fontSize: 11,
              color: '#818cf8',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              PDF · DOCX · PPTX · XLSX · TXT · max 100&nbsp;MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              name="document"
              accept={acceptTypes}
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {selectedFiles.length > 1 && (
              <div style={{
                marginTop: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 999,
                padding: '4px 14px',
                fontSize: 12,
                color: '#818cf8',
                fontWeight: 600,
              }}>
                {selectedFiles.length} files selected
              </div>
            )}
          </div>
        )}

        {/* Paste text */}
        {activeTab === 'paste' && (
          <div>
            <label htmlFor="paste-textarea" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
              Paste your academic text
            </label>
            <textarea
              id="paste-textarea"
              name="pasteText"
              autoComplete="off"
              className={`di-textarea${validationError ? ' error' : ''}`}
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                if (e.target.value.trim().length > 0) setValidationError('');
              }}
              onBlur={() => {
                if (pasteText.trim().length === 0) setValidationError('Please paste some text before submitting.');
                else setValidationError('');
              }}
              maxLength={MAX_PASTE_CHARS}
              rows={10}
              placeholder="Paste your academic text here: research papers, textbook chapters, lecture notes..."
            />
            {validationError && (
              <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#ef4444' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {validationError}
              </div>
            )}
            {/* Progress bar */}
            <div style={{ height: 2, background: 'rgba(99,102,241,0.1)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: barColor,
                width: `${Math.min(charPct * 100, 100)}%`,
                transition: 'width 0.2s, background-color 0.3s',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span aria-live="polite" style={{ fontSize: 12, color: charPct > 0.6 ? barColor : 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s' }}>
                {pasteText.length.toLocaleString()} / {MAX_PASTE_CHARS.toLocaleString()}
              </span>
              <button
                className="di-submit-btn"
                onClick={handlePasteSubmit}
                disabled={isLoading || pasteText.trim().length === 0}
                aria-disabled={isLoading || pasteText.trim().length === 0}
              >
                {isLoading ? (
                  <>
                    <div className="di-spinner" aria-hidden="true" />
                    Processing…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Simplify Document
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Processing state */}
        {isLoading && (
          <div className="di-processing" aria-live="polite">
            <div className="di-spinner" aria-hidden="true" />
            <span key={msgIndex} className="di-msg" style={{ fontSize: 13, fontWeight: 500, color: '#818cf8' }}>
              {PROCESSING_MESSAGES[msgIndex]}
            </span>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div role="alert" style={{
            marginTop: 12, padding: '12px 16px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderLeft: '3px solid #ef4444',
            borderRadius: 10,
            color: '#fca5a5', fontSize: 13,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {getErrorMessage(error)}
          </div>
        )}
      </div>
    </>
  );
}
