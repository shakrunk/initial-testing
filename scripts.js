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
  // Automatically detect sections from the DOM
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
          // Try to get a shorter version
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

      data.push({ id, title, level: 1 });
    });

    return data;
  }

  // ===== MINIMAP INITIALIZATION =====
  function initMinimap() {
    if (!minimapItems) return;

    const tocData = buildTocData();
    if (tocData.length === 0) return;

    minimapItems.innerHTML = "";
    const sections = tocData
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    // Calculate the total document height and the height before first section
    const docHeight = document.documentElement.scrollHeight;
    const firstSection = sections[0];
    const heroHeight = firstSection ? firstSection.offsetTop : 0;

    // Calculate total tracked section height
    const totalSectionHeight = sections.reduce(
      (acc, s) => acc + s.offsetHeight,
      0,
    );

    // Total content height including footer
    const lastSection = sections[sections.length - 1];
    const contentEndOffset = lastSection
      ? lastSection.offsetTop + lastSection.offsetHeight
      : docHeight;
    const footerHeight = docHeight - contentEndOffset;

    // Total tracked height = hero + sections + footer
    const totalTrackedHeight = heroHeight + totalSectionHeight + footerHeight;

    // Add spacer for hero section at the top
    if (heroHeight > 0) {
      const heroFlexGrow = (heroHeight / totalTrackedHeight) * 100;
      const heroSpacer = document.createElement("div");
      heroSpacer.className = "minimap-hero-spacer";
      heroSpacer.style.flex = `${heroFlexGrow} 1 0%`;
      minimapItems.appendChild(heroSpacer);
    }

    tocData.forEach((item, index) => {
      const section = document.getElementById(item.id);
      if (!section) return;

      const sectionHeight = section.offsetHeight;
      const flexGrow = (sectionHeight / totalTrackedHeight) * 100;

      const row = document.createElement("a");
      row.href = `#${item.id}`;
      row.className = `minimap-item level-${item.level}`;
      row.style.flex = `${flexGrow} 1 0%`;
      row.dataset.section = item.id;

      const delay = 100 + index * 20;
      row.innerHTML = `
                <span class="minimap-item-label" style="transition-delay: ${delay}ms;">
                    ${item.title}
                </span>
                <div class="minimap-dot"></div>
            `;

      minimapItems.appendChild(row);
    });

    // Add spacer for footer at the bottom
    if (footerHeight > 0) {
      const footerFlexGrow = (footerHeight / totalTrackedHeight) * 100;
      const footerSpacer = document.createElement("div");
      footerSpacer.className = "minimap-footer-spacer";
      footerSpacer.style.flex = `${footerFlexGrow} 1 0%`;
      minimapItems.appendChild(footerSpacer);
    }

    updateViewportIndicator();
  }

  // ===== VIEWPORT INDICATOR =====
  function updateViewportIndicator() {
    if (!viewportIndicator || !minimapItems) return;

    const tocData = buildTocData();
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollY = window.scrollY;

    const trackHeight = minimapItems.offsetHeight;
    const viewToDocRatio = viewportHeight / docHeight;
    const indicatorHeight = Math.max(trackHeight * viewToDocRatio, 20);

    const scrollableDoc = docHeight - viewportHeight;
    const scrollableTrack = trackHeight - indicatorHeight;
    const scrollRatio = scrollableDoc > 0 ? scrollY / scrollableDoc : 0;
    const scrollAmount = scrollRatio * scrollableTrack;

    viewportIndicator.style.height = `${indicatorHeight}px`;
    viewportIndicator.style.top = `${Math.max(0, scrollAmount)}px`;

    // Update active section - highlight if any part of section is in viewport
    const viewportTop = scrollY;
    const viewportBottom = scrollY + viewportHeight;

    document.querySelectorAll(".minimap-item").forEach((row) => {
      const sectionId = row.dataset.section;
      const sec = document.getElementById(sectionId);
      if (!sec) {
        row.classList.remove("active");
        return;
      }

      const sectionTop = sec.offsetTop;
      const sectionBottom = sectionTop + sec.offsetHeight;

      // Section is in viewport if its top is above viewport bottom AND its bottom is below viewport top
      const isInViewport =
        sectionTop < viewportBottom && sectionBottom > viewportTop;
      row.classList.toggle("active", isInViewport);
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
