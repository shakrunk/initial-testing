// ===== DEMOCRATIC HEALTH SERIES - SHARED SCRIPTS =====

(function () {
  "use strict";

  // ===== ELEMENTS =====
  const minimapItems = document.getElementById("minimapItems");
  const viewportIndicator = document.getElementById("viewportIndicator");
  const citationTooltip = document.getElementById("citationTooltip");
  const returnToReading = document.getElementById("returnToReading");

  let lastClickedCitation = null;
  let hoverTimeout = null;

  // ===== TOC DATA =====
  // Automatically detect sections and subheadings from the DOM
  function buildTocData() {
    const sections = document.querySelectorAll(".section, .works-cited");
    const data = [];

    sections.forEach((section) => {
      const id = section.id;
      if (!id) return;

      // Get title from h2 or use a fallback
      const h2 = section.querySelector("h2");
      let title = "";

      if (h2) {
        title = h2.textContent.trim();
        // Shorten long titles
        if (title.length > 30) {
          const colonIndex = title.indexOf(":");
          if (colonIndex > 0 && colonIndex < 25) {
            title = title.substring(0, colonIndex);
          } else {
            title = title.substring(0, 27) + "...";
          }
        }
      } else {
        title = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }

      data.push({ id, title, level: 1, element: section });

      // Find h3 subheadings within this section
      const subheadings = section.querySelectorAll("h3");
      subheadings.forEach((h3, index) => {
        let subId = h3.id;
        // Generate an ID if the h3 doesn't have one
        if (!subId) {
          subId = `${id}-sub-${index}`;
          h3.id = subId;
        }

        let subTitle = h3.textContent.trim();
        // Shorten long subheading titles
        if (subTitle.length > 35) {
          subTitle = subTitle.substring(0, 32) + "...";
        }

        data.push({ id: subId, title: subTitle, level: 2, element: h3 });
      });
    });

    return data;
  }

  // ===== MINIMAP INITIALIZATION =====
  function initMinimap() {
    if (!minimapItems) return;

    const tocData = buildTocData();
    if (tocData.length === 0) return;

    minimapItems.innerHTML = "";

    // Group items by their parent section for height calculation
    // Each item gets a flex-grow based on its element height relative to total content
    const contentElement = document.querySelector(".content");
    if (!contentElement) return;

    const contentHeight = contentElement.offsetHeight;

    tocData.forEach((item, index) => {
      const element = item.element || document.getElementById(item.id);
      if (!element) return;

      // Calculate height for this item
      let itemHeight;
      if (item.level === 1) {
        // For sections, use the full section height minus subheadings
        const subheadings = element.querySelectorAll("h3");
        let subheadingsHeight = 0;
        subheadings.forEach((h3) => {
          // Estimate height for each subheading area
          const nextH3 = h3.nextElementSibling;
          // Simple estimation: give each subheading some vertical space
        });
        itemHeight = element.offsetHeight;
      } else {
        // For subheadings, estimate height based on content until next heading
        const nextHeading = getNextHeading(element);
        if (nextHeading) {
          itemHeight = nextHeading.offsetTop - element.offsetTop;
        } else {
          // Last subheading - use remaining section height
          const parentSection = element.closest(".section");
          if (parentSection) {
            itemHeight =
              parentSection.offsetTop +
              parentSection.offsetHeight -
              element.offsetTop;
          } else {
            itemHeight = 100; // fallback
          }
        }
      }

      // Skip items with negligible height
      if (itemHeight < 10) itemHeight = 30;

      const flexGrow = Math.max((itemHeight / contentHeight) * 100, 1);

      const row = document.createElement("a");
      row.href = `#${item.id}`;
      row.className = `minimap-item level-${item.level}`;
      row.style.flex = `${flexGrow} 1 0%`;
      row.dataset.section = item.id;

      const delay = 100 + index * 15;
      row.innerHTML = `
                <span class="minimap-item-label" style="transition-delay: ${delay}ms;">
                    ${item.title}
                </span>
                <div class="minimap-dot"></div>
            `;

      minimapItems.appendChild(row);
    });

    updateViewportIndicator();
  }

  // Helper function to find next h2 or h3
  function getNextHeading(element) {
    let sibling = element.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === "H2" || sibling.tagName === "H3") {
        return sibling;
      }
      // Check if we've moved to a new section
      if (sibling.classList && sibling.classList.contains("section")) {
        return sibling.querySelector("h2") || sibling.querySelector("h3");
      }
      sibling = sibling.nextElementSibling;
    }
    return null;
  }

  // ===== VIEWPORT INDICATOR =====
  function updateViewportIndicator() {
    if (!viewportIndicator || !minimapItems) return;

    const contentElement = document.querySelector(".content");
    if (!contentElement) return;

    const viewportHeight = window.innerHeight;
    const contentTop = contentElement.offsetTop;
    const contentHeight = contentElement.offsetHeight;
    const scrollY = window.scrollY;

    const trackHeight = minimapItems.offsetHeight;

    // Calculate viewport position relative to content
    const contentScrollStart = contentTop - viewportHeight * 0.3;
    const contentScrollEnd = contentTop + contentHeight - viewportHeight * 0.7;
    const scrollRange = contentScrollEnd - contentScrollStart;

    // Calculate indicator size and position
    const viewToContentRatio = viewportHeight / contentHeight;
    const indicatorHeight = Math.max(
      Math.min(trackHeight * viewToContentRatio, trackHeight * 0.3),
      20,
    );

    let scrollProgress = 0;
    if (scrollRange > 0) {
      scrollProgress = Math.max(
        0,
        Math.min(1, (scrollY - contentScrollStart) / scrollRange),
      );
    }

    const scrollableTrack = trackHeight - indicatorHeight;
    const scrollAmount = scrollProgress * scrollableTrack;

    viewportIndicator.style.height = `${indicatorHeight}px`;
    viewportIndicator.style.top = `${Math.max(0, Math.min(scrollAmount, scrollableTrack))}px`;

    // Update active items - highlight based on viewport position
    const viewportTop = scrollY;
    const viewportCenter = scrollY + viewportHeight * 0.4;

    document.querySelectorAll(".minimap-item").forEach((row) => {
      const itemId = row.dataset.section;
      const element = document.getElementById(itemId);
      if (!element) {
        row.classList.remove("active");
        return;
      }

      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.offsetHeight;

      // Element is active if viewport center is within it
      const isActive =
        viewportCenter >= elementTop && viewportCenter < elementBottom;
      row.classList.toggle("active", isActive);
    });
  }

  // ===== CITATION SYSTEM =====
  function setupCitations() {
    if (!citationTooltip) return;

    // Find all sup elements and wrap content in links
    document.querySelectorAll("sup").forEach((sup) => {
      const text = sup.textContent.trim();
      const match = text.match(/^(\d+)$/);
      if (match) {
        const num = match[1];
        const citationId = `cite-${num}`;
        const inlineId = `ref-${num}-${Math.random().toString(36).substr(2, 9)}`;

        // Add ID to sup for return navigation
        sup.id = inlineId;

        // Wrap in link if not already
        if (!sup.querySelector("a")) {
          sup.innerHTML = `<a href="#${citationId}" data-citation="${num}" data-return="${inlineId}">${text}</a>`;
        }
      }
    });

    // Setup hover tooltips
    document.querySelectorAll("sup a[data-citation]").forEach((link) => {
      link.addEventListener("mouseenter", function () {
        clearTimeout(hoverTimeout);

        hoverTimeout = setTimeout(() => {
          const citationNum = link.dataset.citation;
          const citationEl = document.getElementById(`cite-${citationNum}`);
          if (!citationEl) return;

          const textEl = citationEl.querySelector(".citation-text");
          const citationText = textEl
            ? textEl.innerHTML
            : citationEl.textContent;

          const header = citationTooltip.querySelector(
            ".citation-tooltip-header",
          );
          const body = citationTooltip.querySelector(".citation-tooltip-text");

          if (header) header.textContent = `Reference ${citationNum}`;
          if (body) body.innerHTML = citationText;

          const rect = link.getBoundingClientRect();
          let left = rect.left;
          const tooltipWidth = 360;

          if (left + tooltipWidth > window.innerWidth - 20) {
            left = window.innerWidth - tooltipWidth - 20;
          }
          if (left < 20) left = 20;

          citationTooltip.style.left = `${left}px`;
          citationTooltip.style.top = `${rect.bottom + 8}px`;
          citationTooltip.classList.add("visible");
        }, 500); // 500ms delay
      });

      link.addEventListener("mouseleave", function () {
        clearTimeout(hoverTimeout);
        citationTooltip.classList.remove("visible");
      });

      // Click handler
      link.addEventListener("click", function (e) {
        e.preventDefault();
        clearTimeout(hoverTimeout);
        citationTooltip.classList.remove("visible");

        lastClickedCitation = link.dataset.return;
        const targetId = link.getAttribute("href").substring(1);
        const target = document.getElementById(targetId);

        if (target) {
          // Remove previous highlights
          document
            .querySelectorAll(".citation-item.highlighted")
            .forEach((el) => {
              el.classList.remove("highlighted");
            });

          // Scroll to citation
          target.scrollIntoView({ behavior: "smooth", block: "center" });

          // Add highlight after scroll
          setTimeout(() => {
            target.classList.add("highlighted");
            if (returnToReading) {
              returnToReading.href = `#${lastClickedCitation}`;
              returnToReading.classList.add("visible");
            }
          }, 400);
        }
      });
    });
  }

  // ===== RETURN TO READING =====
  function setupReturnToReading() {
    if (!returnToReading) return;

    returnToReading.addEventListener("click", function (e) {
      e.preventDefault();

      if (lastClickedCitation) {
        const returnTarget = document.getElementById(lastClickedCitation);
        if (returnTarget) {
          returnTarget.scrollIntoView({ behavior: "smooth", block: "center" });

          // Hide button and remove highlight
          setTimeout(() => {
            returnToReading.classList.remove("visible");
            document
              .querySelectorAll(".citation-item.highlighted")
              .forEach((el) => {
                el.classList.remove("highlighted");
              });
          }, 300);
        }
      }

      lastClickedCitation = null;
    });
  }

  // Hide return button when scrolling away from works cited
  function checkReturnButtonVisibility() {
    if (!returnToReading) return;

    const worksCited = document.getElementById("works-cited");
    if (worksCited && returnToReading.classList.contains("visible")) {
      const rect = worksCited.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        returnToReading.classList.remove("visible");
        document
          .querySelectorAll(".citation-item.highlighted")
          .forEach((el) => {
            el.classList.remove("highlighted");
          });
      }
    }
  }

  // ===== SMOOTH SCROLL FOR MINIMAP =====
  function setupMinimapNavigation() {
    document.addEventListener("click", function (e) {
      const link = e.target.closest(".minimap-item");
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          const offset = 80;
          window.scrollTo({
            top: target.offsetTop - offset,
            behavior: "smooth",
          });
        }
      }
    });
  }

  // ===== SMOOTH SCROLL FOR TOC LINKS =====
  function setupTocNavigation() {
    document.querySelectorAll(".toc-link").forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          const offset = 80;
          window.scrollTo({
            top: target.offsetTop - offset,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    window.addEventListener("scroll", function () {
      updateViewportIndicator();
      checkReturnButtonVisibility();
    });

    window.addEventListener("resize", function () {
      initMinimap();
    });
  }

  // ===== INITIALIZATION =====
  function init() {
    initMinimap();
    setupCitations();
    setupReturnToReading();
    setupMinimapNavigation();
    setupTocNavigation();
    setupEventListeners();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Also run on window load for accurate measurements
  window.addEventListener("load", function () {
    initMinimap();
  });
})();
