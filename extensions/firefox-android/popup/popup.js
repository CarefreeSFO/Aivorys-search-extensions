"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const suggestionsEl = document.getElementById("suggestions");
  const resultsEl = document.getElementById("results");

  let settings = {};
  let debounceTimer = null;
  let activeSuggestion = -1;

  // Initialize
  try {
    settings = await browser.storage.sync.get({
      backend: "https://search.aivorysdev.com",
      language: "en",
      safeSearch: 1,
      theme: "system",
      openInNewTab: false,
      categories: "general",
    });
    applyTheme(settings.theme || "system");
  } catch {
    settings = { backend: "https://search.aivorysdev.com", language: "en" };
  }

  // Localize
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const msg = browser.i18n.getMessage(el.getAttribute("data-i18n"));
    if (msg) el.textContent = msg;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const msg = browser.i18n.getMessage(el.getAttribute("data-i18n-placeholder"));
    if (msg) el.setAttribute("placeholder", msg);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const msg = browser.i18n.getMessage(el.getAttribute("data-i18n-title"));
    if (msg) el.setAttribute("title", msg);
  });

  // Events
  searchInput.addEventListener("input", onInput);
  searchInput.addEventListener("keydown", onKeydown);
  searchBtn.addEventListener("click", () => doSearch(searchInput.value.trim()));
  settingsBtn.addEventListener("click", () => {
    browser.runtime.openOptionsPage();
  });

  searchInput.focus();

  function onInput(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
      hideSuggestions();
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestions(query), 250);
  }

  function onKeydown(e) {
    const items = suggestionsEl.querySelectorAll(".suggestion-item");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeSuggestion = Math.min(activeSuggestion + 1, items.length - 1);
      updateActiveSuggestion(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeSuggestion = Math.max(activeSuggestion - 1, -1);
      updateActiveSuggestion(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion >= 0 && items[activeSuggestion]) {
        searchInput.value = items[activeSuggestion].textContent;
      }
      doSearch(searchInput.value.trim());
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  }

  function updateActiveSuggestion(items) {
    items.forEach((item, i) => {
      item.classList.toggle("active", i === activeSuggestion);
    });
    if (activeSuggestion >= 0 && items[activeSuggestion]) {
      searchInput.value = items[activeSuggestion].textContent;
    }
  }

  async function fetchSuggestions(query) {
    try {
      const response = await fetch(
        `${settings.backend}/autocompleter?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) return;
      const suggestions = await response.json();
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        hideSuggestions();
        return;
      }
      showSuggestions(suggestions.slice(0, 6));
    } catch {
      hideSuggestions();
    }
  }

  function showSuggestions(items) {
    suggestionsEl.innerHTML = "";
    activeSuggestion = -1;
    items.forEach((text) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.textContent = typeof text === "string" ? text : text.toString();
      div.addEventListener("click", () => {
        searchInput.value = div.textContent;
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

    resultsEl.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <div>${browser.i18n.getMessage("searching") || "Searching..."}</div>
      </div>
    `;

    if (settings.openInNewTab) {
      const url = `${settings.backend}/search?q=${encodeURIComponent(query)}&language=${settings.language || "en"}`;
      browser.tabs.create({ url });
      window.close();
      return;
    }

    try {
      const response = await browser.runtime.sendMessage({
        action: "search",
        query: query,
        options: {
          language: settings.language,
          safeSearch: settings.safeSearch,
          categories: settings.categories,
        },
      });

      if (response.error) {
        showError(response.error);
        return;
      }

      const results = response.results || [];
      if (results.length === 0) {
        resultsEl.innerHTML = `<div class="no-results">${browser.i18n.getMessage("noResults") || "No results found."}</div>`;
        return;
      }
      renderResults(results);
    } catch (err) {
      showError(err.message);
    }
  }

  function renderResults(results) {
    resultsEl.innerHTML = "";
    results.slice(0, 8).forEach((r) => {
      const item = document.createElement("div");
      item.className = "result-item";
      const displayURL = r.url ? new URL(r.url).hostname.replace("www.", "") : "";
      item.innerHTML = `
        <div class="result-url">${escapeHTML(displayURL)}</div>
        <a class="result-title" href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(r.title)}</a>
        <div class="result-snippet">${escapeHTML(r.content || r.snippet || "")}</div>
      `;
      item.querySelector(".result-title").addEventListener("click", (e) => {
        e.preventDefault();
        browser.tabs.create({ url: r.url });
      });
      resultsEl.appendChild(item);
    });
  }

  function showError(message) {
    resultsEl.innerHTML = `
      <div class="error-message">
        ${browser.i18n.getMessage("searchError") || "Search error."}<br>
        <small>${escapeHTML(message)}</small>
      </div>
    `;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
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
