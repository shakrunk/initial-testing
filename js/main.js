// ===== DEMOCRATIC HEALTH SERIES - MAIN =====
import { setupTheme } from "./theme.js";
import { initMinimap, setupMinimapNavigation, updateViewportIndicator } from "./minimap.js";
import { setupCitations, setupReturnToReading, checkReturnButtonVisibility } from "./citations.js";
import { setupHeadingLinks, setupSelectionMenu, setupMetaToggle, setupScrollIndicator, setupMobileToc, setupTocNavigation } from "./ui.js";

function init() {
  console.log("Initializing application...");

  try { setupTheme(); } catch (e) { console.error("Theme setup failed:", e); }

  try { initMinimap(); } catch (e) { console.error("Minimap setup failed:", e); }

  try { setupHeadingLinks(); } catch (e) { console.error("Heading links setup failed:", e); }

  try { setupSelectionMenu(); } catch (e) { console.error("Selection menu setup failed:", e); }

  try { setupCitations(); } catch (e) { console.error("Citations setup failed:", e); }

  try { setupReturnToReading(); } catch (e) { console.error("Return to reading setup failed:", e); }

  try { setupMinimapNavigation(); } catch (e) { console.error("Minimap nav setup failed:", e); }

  try { setupTocNavigation(); } catch (e) { console.error("TOC nav setup failed:", e); }

  try { setupMetaToggle(); } catch (e) { console.error("Meta toggle setup failed:", e); }

  try { setupScrollIndicator(); } catch (e) { console.error("Scroll indicator setup failed:", e); }

  try { setupMobileToc(); } catch (e) { console.error("Mobile TOC setup failed:", e); }

  // Event Listeners
  window.addEventListener("scroll", function () {
      try {
          updateViewportIndicator();
      } catch (e) { console.error("Viewport update failed:", e); }

      try {
          checkReturnButtonVisibility();
      } catch (e) { console.error("Return button check failed:", e); }
  });

  window.addEventListener("resize", function () {
      try {
          initMinimap();
      } catch (e) { console.error("Minimap resize failed:", e); }
  });
}

// Run on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Also run on window load for accurate measurements
window.addEventListener("load", function () {
  try {
      initMinimap();
  } catch (e) { console.error("Minimap load failed:", e); }
});
