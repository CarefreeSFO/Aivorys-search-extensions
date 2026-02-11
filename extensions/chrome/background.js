"use strict";

const DEFAULT_BACKEND = "https://search.aivorysdev.com";

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.sync.set({
      backend: DEFAULT_BACKEND,
      language: "en",
      safeSearch: 1,
      theme: "system",
      openInNewTab: false,
      categories: "general",
    });
  }
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const settings = await chrome.storage.sync.get({ backend: DEFAULT_BACKEND, language: "en" });
  const searchURL = `${settings.backend}/search?q=${encodeURIComponent(text)}&language=${settings.language}`;

  switch (disposition) {
    case "currentTab":
      chrome.tabs.update({ url: searchURL });
      break;
    case "newForegroundTab":
      chrome.tabs.create({ url: searchURL });
      break;
    case "newBackgroundTab":
      chrome.tabs.create({ url: searchURL, active: false });
      break;
  }
});

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (text.length < 2) return;

  const settings = await chrome.storage.sync.get({ backend: DEFAULT_BACKEND });

  try {
    const response = await fetch(
      `${settings.backend}/autocompleter?q=${encodeURIComponent(text)}`
    );
    if (!response.ok) return;

    const suggestions = await response.json();
    const results = suggestions
      .filter((s) => typeof s === "string")
      .slice(0, 5)
      .map((s) => ({
        content: s,
        description: `Aivorys: ${s}`,
      }));

    suggest(results);
  } catch {
    // Silently fail on autocomplete errors
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "search") {
    handleSearch(message.query, message.options).then(sendResponse);
    return true;
  }
  if (message.action === "getSettings") {
    chrome.storage.sync.get(null, sendResponse);
    return true;
  }
});

async function handleSearch(query, options = {}) {
  const settings = await chrome.storage.sync.get({
    backend: DEFAULT_BACKEND,
    language: "en",
    safeSearch: 1,
    categories: "general",
  });

  const params = new URLSearchParams({
    q: query,
    format: "json",
    language: options.language || settings.language,
    pageno: options.page || 1,
    categories: options.categories || settings.categories,
    safesearch: options.safeSearch ?? settings.safeSearch,
  });

  try {
    const response = await fetch(`${settings.backend}/search?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    return { error: err.message, results: [] };
  }
}
