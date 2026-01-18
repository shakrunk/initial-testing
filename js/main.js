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

// Security: Enforce safe rel attributes for external and target="_blank" links
function secureLink(link) {
  try {
    if (!link.href) return;

    // Use link.href (resolved absolute URL)
    const url = new URL(link.href);
    const isExternal = url.hostname !== window.location.hostname;
    const isTargetBlank = link.target === "_blank";

    if (isExternal || isTargetBlank) {
      const currentRel = link.getAttribute("rel") || "";
      const rels = new Set(currentRel.split(/\s+/).filter(Boolean));

      if (isExternal) {
        rels.add("noopener");
        rels.add("noreferrer");
      } else if (isTargetBlank) {
        // Internal target="_blank" requires noopener to prevent reverse tabnapping
        rels.add("noopener");
      }

      link.setAttribute("rel", Array.from(rels).join(" "));
    }
  } catch (e) {
    // Ignore invalid URLs or other errors
  }
}

function initLinkSecurity() {
  // Initial check for all links
  document.querySelectorAll("a").forEach(secureLink);

  // Watch for new links added dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // ELEMENT_NODE
          if (node.tagName === "A") {
            secureLink(node);
          }
          // Check children of added node
          if (node.querySelectorAll) {
            node.querySelectorAll("a").forEach(secureLink);
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
    initLinkSecurity();
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
