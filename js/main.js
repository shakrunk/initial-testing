// ===== DEMOCRATIC HEALTH SERIES - MAIN =====
import { setupTheme } from "./theme.js";
import {
  initMinimap,
  setupMinimapNavigation,
  updateViewportIndicator,
} from "./minimap.js";
import {
  setupCitations,
  setupReturnToReading,
  checkReturnButtonVisibility,
} from "./citations.js";
import {
  setupHeadingLinks,
  setupSelectionMenu,
  setupMetaToggle,
  setupScrollIndicator,
  setupMobileToc,
  setupTocNavigation,
} from "./ui.js";

function init() {
  console.log("Initializing application...");

  try {
    setupTheme();
    console.log("   Theme setup completed");
  } catch (e) {
    console.error("Theme setup failed:", e);
  }

  try {
    initMinimap();
    console.log("   Minimap setup completed");
  } catch (e) {
    console.error("Minimap setup failed:", e);
  }

  try {
    setupHeadingLinks();
    console.log("   Heading links setup completed");
  } catch (e) {
    console.error("Heading links setup failed:", e);
  }

  try {
    setupSelectionMenu();
    console.log("   Selection menu setup completed");
  } catch (e) {
    console.error("Selection menu setup failed:", e);
  }

  try {
    setupCitations();
    console.log("   Citations setup completed");
  } catch (e) {
    console.error("Citations setup failed:", e);
  }

  try {
    setupReturnToReading();
    console.log("   'Return to reading' setup completed");
  } catch (e) {
    console.error("Return to reading setup failed:", e);
  }

  try {
    setupMinimapNavigation();
    console.log("   Minimap navigation setup completed");
  } catch (e) {
    console.error("Minimap nav setup failed:", e);
  }

  try {
    setupTocNavigation();
    console.log("   TOC navigation setup completed");
  } catch (e) {
    console.error("TOC nav setup failed:", e);
  }

  try {
    setupMetaToggle();
    console.log("   Meta toggle setup completed");
  } catch (e) {
    console.error("Meta toggle setup failed:", e);
  }

  try {
    setupScrollIndicator();
    console.log("   Scroll indicator setup completed");
  } catch (e) {
    console.error("Scroll indicator setup failed:", e);
  }

  try {
    setupMobileToc();
    console.log("   Mobile TOC setup completed");
  } catch (e) {
    console.error("Mobile TOC setup failed:", e);
  }

  // Event Listeners
  window.addEventListener("scroll", function () {
    try {
      updateViewportIndicator();
      console.log("Viewport indicator updated");
    } catch (e) {
      console.error("Viewport update failed:", e);
    }

    try {
      checkReturnButtonVisibility();
      console.log("Return button visibility checked");
    } catch (e) {
      console.error("Return button check failed:", e);
    }
  });

  window.addEventListener("resize", function () {
    try {
      initMinimap();
      console.log("Minimap resized");
    } catch (e) {
      console.error("Minimap resize failed:", e);
    }
  });

  console.log("Application initialized");
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
  } catch (e) {
    console.error("Minimap load failed:", e);
  }
});
