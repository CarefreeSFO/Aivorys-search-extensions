"use strict";

// Content script for search.aivorysdev.com
// Enhances the SearXNG interface with extension-specific features

(function () {
  // Strip tracking parameters from outbound links
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    try {
      const url = new URL(link.href);
      const trackingParams = [
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "fbclid", "gclid", "msclkid", "mc_cid", "mc_eid",
      ];

      let cleaned = false;
      trackingParams.forEach((param) => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
          cleaned = true;
        }
      });

      if (cleaned) {
        link.href = url.toString();
      }
    } catch {
      // Invalid URL, ignore
    }
  });

  // Add keyboard shortcut: "/" to focus search input
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !isInputFocused()) {
      e.preventDefault();
      const searchInput = document.querySelector('input[name="q"]');
      if (searchInput) searchInput.focus();
    }
  });

  function isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable);
  }
})();
