(function () {
  'use strict';

  // Export for testing
  function extractContent() {
    const selectors = ['main', '#content', '.content', 'article'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText && el.innerText.trim().length > 0) {
        return el.innerText.trim();
      }
    }
    return '';
  }

  function injectButton() {
    if (document.getElementById('cognisync-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'cognisync-btn';
    btn.textContent = 'Simplify with CogniSync';
    btn.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:99999',
      'padding:10px 18px', 'background:#6366f1', 'color:#fff',
      'border:none', 'border-radius:8px', 'font-size:14px',
      'font-weight:600', 'cursor:pointer',
      'box-shadow:0 4px 16px rgba(99,102,241,0.5)',
    ].join(';');

    btn.addEventListener('click', () => {
      const text = extractContent();
      if (!text) {
        btn.title = 'Could not detect content area — please paste text manually';
      }
      chrome.runtime.sendMessage({ type: 'OPEN_APP', text });
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }

  // Expose for testing
  if (typeof module !== 'undefined') {
    module.exports = { extractContent };
  }
})();
