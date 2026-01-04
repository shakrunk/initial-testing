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

// Security: Add rel="noopener noreferrer" to external links
function secureLink(link) {
  try {
    const url = new URL(link.href);
    if (url.hostname !== window.location.hostname) {
      // Preserve existing rel values if any
      const existingRel = link.getAttribute("rel") || "";
      const requiredRel = "noopener noreferrer";

      if (
        !existingRel.includes("noopener") ||
        !existingRel.includes("noreferrer")
      ) {
        const newRel = existingRel
          ? `${existingRel} ${requiredRel}`
          : requiredRel;
        link.setAttribute("rel", newRel.trim());
      }
    }
  } catch (e) {
    // Ignore invalid URLs
  }
}

function secureExternalLinks() {
  // Initial check for existing links
  document.querySelectorAll("a[href^='http']").forEach(secureLink);

  // Watch for new links added dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // ELEMENT_NODE
          if (node.tagName === "A" && node.href.startsWith("http")) {
            secureLink(node);
          }
          // Check children of added node
          if (node.querySelectorAll) {
            node.querySelectorAll("a[href^='http']").forEach(secureLink);
          }
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function init() {
  try {
    setupTheme();
  } catch (e) {
    console.error("Theme setup failed");
  }

  try {
    initMinimap();
  } catch (e) {
    console.error("Minimap setup failed");
  }

  try {
    setupHeadingLinks();
  } catch (e) {
    console.error("Heading links setup failed");
  }

  try {
    setupSelectionMenu();
  } catch (e) {
    console.error("Selection menu setup failed");
  }

  try {
    setupCitations();
  } catch (e) {
    console.error("Citations setup failed");
  }

  try {
    setupReturnToReading();
  } catch (e) {
    console.error("Return to reading setup failed");
  }

  try {
    setupMinimapNavigation();
  } catch (e) {
    console.error("Minimap nav setup failed");
  }

  try {
    setupTocNavigation();
  } catch (e) {
    console.error("TOC nav setup failed");
  }

  try {
    setupMetaToggle();
  } catch (e) {
    console.error("Meta toggle setup failed");
  }

  try {
    setupScrollIndicator();
  } catch (e) {
    console.error("Scroll indicator setup failed");
  }

  try {
    setupMobileToc();
  } catch (e) {
    console.error("Mobile TOC setup failed");
  }

  try {
    secureExternalLinks();
  } catch (e) {
    console.error("Link security setup failed");
  }

  // Event Listeners
  window.addEventListener(
    "scroll",
    function () {
      try {
        updateViewportIndicator();
      } catch (e) {
        // Silent fail on scroll to prevent log flooding
      }

      try {
        checkReturnButtonVisibility();
      } catch (e) {
        // Silent fail on scroll
      }
    },
    { passive: true },
  ); // Add passive listener for performance

  window.addEventListener("resize", function () {
    try {
      initMinimap();
    } catch (e) {
      console.error("Minimap resize failed");
    }
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
  } catch (e) {
    console.error("Minimap load failed");
  }
});
