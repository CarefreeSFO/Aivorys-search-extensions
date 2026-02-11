"use strict";

const AivorysAPI = {
  DEFAULT_BACKEND: "https://search.aivorysdev.com",

  async search(query, options = {}) {
    const backend = options.backend || this.DEFAULT_BACKEND;
    const lang = options.language || "en";
    const page = options.page || 1;
    const categories = options.categories || "general";
    const safeSearch = options.safeSearch ?? 1;

    const params = new URLSearchParams({
      q: query,
      format: "json",
      language: lang,
      pageno: page,
      categories: categories,
      safesearch: safeSearch,
    });

    const url = `${backend}/search?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        results: (data.results || []).map((r) => ({
          title: r.title || "",
          url: r.url || "",
          snippet: r.content || "",
          engine: r.engine || "",
          category: r.category || "",
        })),
        suggestions: data.suggestions || [],
        infoboxes: data.infoboxes || [],
        query: query,
        page: page,
      };
    } catch (err) {
      console.error("[Aivorys] Search error:", err.message);
      return { results: [], suggestions: [], infoboxes: [], query, page, error: err.message };
    }
  },

  async autocomplete(query, options = {}) {
    const backend = options.backend || this.DEFAULT_BACKEND;
    const url = `${backend}/autocompleter?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  buildSearchURL(query, options = {}) {
    const backend = options.backend || this.DEFAULT_BACKEND;
    const lang = options.language || "en";
    const params = new URLSearchParams({
      q: query,
      language: lang,
    });
    return `${backend}/search?${params.toString()}`;
  },
};

if (typeof module !== "undefined") {
  module.exports = AivorysAPI;
}
