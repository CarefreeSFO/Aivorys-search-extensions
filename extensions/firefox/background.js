"use strict";

const DEFAULT_BACKEND = "https://search.aivorysdev.com";

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    browser.storage.sync.set({
      backend: DEFAULT_BACKEND,
      language: "en",
      safeSearch: 1,
      theme: "system",
      openInNewTab: false,
      categories: "general",
    });
  }
});

browser.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const settings = await browser.storage.sync.get({ backend: DEFAULT_BACKEND, language: "en" });
  const searchURL = `${settings.backend}/search?q=${encodeURIComponent(text)}&language=${settings.language}`;

  switch (disposition) {
    case "currentTab":
      browser.tabs.update({ url: searchURL });
      break;
    case "newForegroundTab":
      browser.tabs.create({ url: searchURL });
      break;
    case "newBackgroundTab":
      browser.tabs.create({ url: searchURL, active: false });
      break;
  }
});

browser.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (text.length < 2) return;

  const settings = await browser.storage.sync.get({ backend: DEFAULT_BACKEND });

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
    // Silently fail
  }
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "search") {
    return handleSearch(message.query, message.options);
  }
  if (message.action === "getSettings") {
    return browser.storage.sync.get(null);
  }
});

async function handleSearch(query, options = {}) {
  const settings = await browser.storage.sync.get({
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
