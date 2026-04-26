const APP_URL = 'http://localhost:5173';

chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'OPEN_APP') return;
  const url = message.text
    ? `${APP_URL}/?text=${encodeURIComponent(message.text)}`
    : APP_URL;
  chrome.tabs.create({ url });
});

// Preserve user config across updates
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(null);
  if (Object.keys(existing).length === 0) {
    await chrome.storage.local.set({ profile: 'default', theme: 'dark' });
  }
});
