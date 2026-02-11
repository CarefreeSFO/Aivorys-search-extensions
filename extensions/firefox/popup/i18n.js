"use strict";

const AivorysI18n = {
  getMessage(key, substitutions) {
    if (typeof chrome !== "undefined" && chrome.i18n) {
      return chrome.i18n.getMessage(key, substitutions) || key;
    }
    if (typeof browser !== "undefined" && browser.i18n) {
      return browser.i18n.getMessage(key, substitutions) || key;
    }
    return key;
  },

  getUILanguage() {
    if (typeof chrome !== "undefined" && chrome.i18n) {
      return chrome.i18n.getUILanguage();
    }
    if (typeof browser !== "undefined" && browser.i18n) {
      return browser.i18n.getUILanguage();
    }
    return navigator.language || "en";
  },

  localizeDocument() {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const msg = this.getMessage(key);
      if (msg && msg !== key) {
        el.textContent = msg;
      }
    });

    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const msg = this.getMessage(key);
      if (msg && msg !== key) {
        el.setAttribute("placeholder", msg);
      }
    });

    const titles = document.querySelectorAll("[data-i18n-title]");
    titles.forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const msg = this.getMessage(key);
      if (msg && msg !== key) {
        el.setAttribute("title", msg);
      }
    });
  },
};

if (typeof module !== "undefined") {
  module.exports = AivorysI18n;
}
