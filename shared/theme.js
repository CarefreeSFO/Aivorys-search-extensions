"use strict";

const AivorysTheme = {
  THEMES: ["light", "dark", "system"],

  async apply() {
    const settings = await AivorysSettings.load();
    const theme = settings.theme || "system";
    this.set(theme);
  },

  set(theme) {
    const root = document.documentElement;

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");

      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        root.setAttribute("data-theme", e.matches ? "dark" : "light");
      });
    } else {
      root.setAttribute("data-theme", theme);
    }
  },
};

if (typeof module !== "undefined") {
  module.exports = AivorysTheme;
}
