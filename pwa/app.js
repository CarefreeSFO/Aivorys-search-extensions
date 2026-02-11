"use strict";

const DEFAULTS = {
  backend: "https://search.aivorysdev.com",
  language: "en",
  safeSearch: 1,
  theme: "system",
};

let settings = { ...DEFAULTS };

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  registerServiceWorker();

  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const suggestionsEl = document.getElementById("suggestions");
  const resultsEl = document.getElementById("results");
  const loadingEl = document.getElementById("loading");
  const settingsLink = document.getElementById("settings-link");
  const modal = document.getElementById("settings-modal");
  const closeModal = document.getElementById("close-modal");
  const saveSettings = document.getElementById("save-settings");

  let debounceTimer = null;
  let activeSuggestion = -1;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    doSearch(input.value.trim());
  });

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (q.length < 2) { hideSuggestions(); return; }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestions(q), 250);
  });

  input.addEventListener("keydown", (e) => {
    const items = suggestionsEl.querySelectorAll(".suggestion-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeSuggestion = Math.min(activeSuggestion + 1, items.length - 1);
      highlightSuggestion(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeSuggestion = Math.max(activeSuggestion - 1, -1);
      highlightSuggestion(items);
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  settingsLink.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("pwa-backend").value = settings.backend;
    document.getElementById("pwa-language").value = settings.language;
    document.getElementById("pwa-safe").value = settings.safeSearch;
    document.getElementById("pwa-theme").value = settings.theme;
    modal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  saveSettings.addEventListener("click", () => {
    settings.backend = document.getElementById("pwa-backend").value.trim().replace(/\/+$/, "") || DEFAULTS.backend;
    settings.language = document.getElementById("pwa-language").value;
    settings.safeSearch = parseInt(document.getElementById("pwa-safe").value, 10);
    settings.theme = document.getElementById("pwa-theme").value;
    localStorage.setItem("aivorys_settings", JSON.stringify(settings));
    applyTheme(settings.theme);
    modal.classList.add("hidden");
  });

  function highlightSuggestion(items) {
    items.forEach((item, i) => item.classList.toggle("active", i === activeSuggestion));
    if (activeSuggestion >= 0 && items[activeSuggestion]) {
      input.value = items[activeSuggestion].textContent;
    }
  }

  async function fetchSuggestions(query) {
    try {
      const resp = await fetch(`${settings.backend}/autocompleter?q=${encodeURIComponent(query)}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) { hideSuggestions(); return; }
      showSuggestions(data.slice(0, 6));
    } catch { hideSuggestions(); }
  }

  function showSuggestions(items) {
    suggestionsEl.innerHTML = "";
    activeSuggestion = -1;
    items.forEach((text) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.textContent = typeof text === "string" ? text : String(text);
      div.addEventListener("click", () => {
        input.value = div.textContent;
        hideSuggestions();
        doSearch(div.textContent);
      });
      suggestionsEl.appendChild(div);
    });
    suggestionsEl.classList.remove("hidden");
  }

  function hideSuggestions() {
    suggestionsEl.classList.add("hidden");
    suggestionsEl.innerHTML = "";
    activeSuggestion = -1;
  }

  async function doSearch(query) {
    if (!query) return;
    hideSuggestions();
    resultsEl.innerHTML = "";
    loadingEl.classList.remove("hidden");

    const params = new URLSearchParams({
      q: query,
      format: "json",
      language: settings.language,
      safesearch: settings.safeSearch,
    });

    try {
      const resp = await fetch(`${settings.backend}/search?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });

      loadingEl.classList.add("hidden");

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const results = data.results || [];

      if (results.length === 0) {
        resultsEl.innerHTML = '<div class="no-results">No results found.</div>';
        return;
      }

      renderResults(results);
    } catch (err) {
      loadingEl.classList.add("hidden");
      resultsEl.innerHTML = `<div class="error-msg">Search error: ${escapeHTML(err.message)}</div>`;
    }
  }

  function renderResults(results) {
    resultsEl.innerHTML = "";
    results.slice(0, 15).forEach((r) => {
      const item = document.createElement("div");
      item.className = "result-item";
      let host = "";
      try { host = new URL(r.url).hostname.replace("www.", ""); } catch {}
      item.innerHTML = `
        <div class="result-url">${escapeHTML(host)}</div>
        <a class="result-title" href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(r.title)}</a>
        <div class="result-snippet">${escapeHTML(r.content || "")}</div>
      `;
      resultsEl.appendChild(item);
    });
  }

  function escapeHTML(str) {
    const d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }
});

function loadSettings() {
  try {
    const saved = localStorage.getItem("aivorys_settings");
    if (saved) settings = { ...DEFAULTS, ...JSON.parse(saved) };
  } catch {}
  applyTheme(settings.theme);
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

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}
