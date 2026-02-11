"use strict";

const DEFAULTS = {
  backend: "https://search.aivorysdev.com",
  language: "en",
  safeSearch: 1,
  theme: "system",
  openInNewTab: false,
  categories: "general",
};

document.addEventListener("DOMContentLoaded", () => {
  const fields = {
    backend: document.getElementById("backend"),
    language: document.getElementById("language"),
    safeSearch: document.getElementById("safeSearch"),
    categories: document.getElementById("categories"),
    theme: document.getElementById("theme"),
    openInNewTab: document.getElementById("openInNewTab"),
  };

  const saveBtn = document.getElementById("save-btn");
  const resetBtn = document.getElementById("reset-btn");
  const statusEl = document.getElementById("status");

  // Load current settings
  chrome.storage.sync.get(DEFAULTS, (settings) => {
    fields.backend.value = settings.backend;
    fields.language.value = settings.language;
    fields.safeSearch.value = settings.safeSearch;
    fields.categories.value = settings.categories;
    fields.theme.value = settings.theme;
    fields.openInNewTab.checked = settings.openInNewTab;

    applyTheme(settings.theme);
  });

  // Save
  saveBtn.addEventListener("click", () => {
    const settings = {
      backend: fields.backend.value.trim().replace(/\/+$/, "") || DEFAULTS.backend,
      language: fields.language.value,
      safeSearch: parseInt(fields.safeSearch.value, 10),
      categories: fields.categories.value,
      theme: fields.theme.value,
      openInNewTab: fields.openInNewTab.checked,
    };

    chrome.storage.sync.set(settings, () => {
      showStatus();
      applyTheme(settings.theme);
    });
  });

  // Reset
  resetBtn.addEventListener("click", () => {
    chrome.storage.sync.set(DEFAULTS, () => {
      fields.backend.value = DEFAULTS.backend;
      fields.language.value = DEFAULTS.language;
      fields.safeSearch.value = DEFAULTS.safeSearch;
      fields.categories.value = DEFAULTS.categories;
      fields.theme.value = DEFAULTS.theme;
      fields.openInNewTab.checked = DEFAULTS.openInNewTab;
      applyTheme(DEFAULTS.theme);
      showStatus();
    });
  });

  // Theme change live preview
  fields.theme.addEventListener("change", () => {
    applyTheme(fields.theme.value);
  });

  function showStatus() {
    statusEl.classList.add("visible");
    setTimeout(() => statusEl.classList.remove("visible"), 2000);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "system") {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", dark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }
});
