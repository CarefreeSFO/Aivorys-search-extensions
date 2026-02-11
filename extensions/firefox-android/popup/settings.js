"use strict";

const AivorysSettings = {
  DEFAULTS: {
    backend: "https://search.aivorysdev.com",
    language: "en",
    safeSearch: 1,
    theme: "system",
    openInNewTab: false,
    categories: "general",
  },

  LANGUAGES: [
    { code: "en", name: "English" },
    { code: "es", name: "Espa\u00f1ol (Latinoam\u00e9rica)" },
    { code: "pt-BR", name: "Portugu\u00eas (Brasil)" },
  ],

  SAFE_SEARCH_LEVELS: [
    { value: 0, label: "off" },
    { value: 1, label: "moderate" },
    { value: 2, label: "strict" },
  ],

  CATEGORIES: ["general", "images", "videos", "news", "map", "music", "it", "science", "files"],

  _getStorage() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      return chrome.storage;
    }
    if (typeof browser !== "undefined" && browser.storage) {
      return browser.storage;
    }
    return null;
  },

  async load() {
    const storage = this._getStorage();
    if (!storage) return { ...this.DEFAULTS };

    return new Promise((resolve) => {
      storage.sync.get(this.DEFAULTS, (items) => {
        resolve(items);
      });
    });
  },

  async save(settings) {
    const storage = this._getStorage();
    if (!storage) return;

    const clean = {};
    for (const key of Object.keys(this.DEFAULTS)) {
      if (settings[key] !== undefined) {
        clean[key] = settings[key];
      }
    }

    return new Promise((resolve) => {
      storage.sync.set(clean, resolve);
    });
  },

  async get(key) {
    const all = await this.load();
    return all[key];
  },

  async set(key, value) {
    return this.save({ [key]: value });
  },

  async reset() {
    return this.save({ ...this.DEFAULTS });
  },
};

if (typeof module !== "undefined") {
  module.exports = AivorysSettings;
}
