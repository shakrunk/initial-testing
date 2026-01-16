// ===== THEME TOGGLE =====
import { safeStorage } from "./utils.js";

export function setupTheme() {
  const toggle = document.getElementById("themeToggle");
  const storedTheme = safeStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Set initial state
  if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      if (currentTheme === "dark") {
        document.documentElement.removeAttribute("data-theme");
        safeStorage.setItem("theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        safeStorage.setItem("theme", "dark");
      }
    });
  }
}
