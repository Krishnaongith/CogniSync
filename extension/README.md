# CogniSync Browser Extension

Injects a "Simplify with CogniSync" button on Canvas (Instructure) and Blackboard pages. When clicked, it extracts the page's main content and opens the CogniSync web app with that text pre-loaded.

## Supported Browsers

- **Chrome** (and Chromium-based browsers) — uses Manifest V3 (`manifest.json`)
- **Firefox** — uses Manifest V2 (`manifest.firefox.json`)

## Active Sites

The content script runs on:
- `*://*.instructure.com/*` (Canvas LMS)
- `*://*.blackboard.com/*`

## Prerequisites

The CogniSync frontend must be running at `http://localhost:5173` (the background script opens that URL).

## Load in Chrome (Developer Mode)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder

## Load in Firefox (Developer Mode)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `extension/manifest.firefox.json`

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome Manifest V3 config |
| `manifest.firefox.json` | Firefox Manifest V2 config |
| `content.js` | Injected into LMS pages; adds the floating button and extracts page text |
| `background.js` | Service worker; opens the app tab with extracted text as a URL query param; initialises default storage (`profile: default`, `theme: dark`) on install |
| `settingsHelper.js` | Utility to preserve existing storage on extension updates |

## No Build Step

The extension is plain JavaScript. No bundler or compilation is needed — load the folder directly.
