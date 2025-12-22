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

    const contentElement = document.querySelector(".content");
    const worksCitedElement = document.querySelector(".works-cited");
    if (!contentElement) return;

    // Helper: Get Y position relative to the entire document
    // This ensures consistency between the indicator and the items
    const getPageY = (el) => {
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    };

    // Calculate total boundaries
    const contentTop = getPageY(contentElement);
    const contentBottom = worksCitedElement
      ? getPageY(worksCitedElement) + worksCitedElement.offsetHeight
      : contentTop + contentElement.offsetHeight;

    const totalHeight = contentBottom - contentTop;

    tocData.forEach((item, index) => {
      const element = item.element || document.getElementById(item.id);
      if (!element) return;

      const itemTop = getPageY(element);

      // Calculate the bottom of this segment based on the START of the next segment.
      // This ensures 100% coverage of the scrollable area, including margins.
      let nextTop;
      if (index < tocData.length - 1) {
        const nextItem = tocData[index + 1];
        const nextElement =
          nextItem.element || document.getElementById(nextItem.id);
        nextTop = getPageY(nextElement);
      } else {
        // The last item extends to the very bottom of the content
        nextTop = contentBottom;
      }

      // Height is simply the delta
      let itemHeight = nextTop - itemTop;

      // Sanity check for negative heights (in case of weird DOM ordering)
      itemHeight = Math.max(itemHeight, 0);

      // Use the raw pixel height as the flex-grow factor.
      // Flexbox will distribute the space exactly proportionally to the real document.
      // We ensure at least 1 unit so it remains technically visible.
      const flexGrow = Math.max(itemHeight, 1);

      const row = document.createElement("a");
      row.href = `#${item.id}`;
      row.className = `minimap-item level-${item.level}`;
      row.style.flex = `${flexGrow} 1 0%`;
      row.dataset.section = item.id;

      const delay = 100 + index * 15;

      const label = document.createElement("span");
      label.className = "minimap-item-label";
      label.style.transitionDelay = `${delay}ms`;
      label.textContent = item.title;

      const dot = document.createElement("div");
      dot.className = "minimap-dot";

      row.appendChild(label);
      row.appendChild(dot);

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
    const worksCited = document.querySelector(".works-cited");
    if (!contentElement) return;

    // Get the exact dimensions of the viewport and content
    const viewportHeight = window.innerHeight;
    const contentTop = contentElement.offsetTop;

    // Calculate total height covered by the minimap
    const contentBottom = worksCited
      ? worksCited.offsetTop + worksCited.offsetHeight
      : contentElement.offsetTop + contentElement.offsetHeight;

    const contentHeight = contentBottom - contentTop;
    const trackHeight = minimapItems.offsetHeight;

    // Calculate the ratio of minimap px to content px
    const scale = trackHeight / contentHeight;

    // Use the ratio to calculate the indicator height
    let indicatorHeight = viewportHeight * scale;
    indicatorHeight = Math.max(indicatorHeight, 20); // minimum indicator size?

    // Calculate indicator position
    const scrollY = window.scrollY;
    const relativeScroll = scrollY - contentTop;
    const indicatorTop = relativeScroll * scale;

    // Then apply styles with bound checking
    const maxTop = trackHeight - indicatorHeight;
    const clampedTop = Math.max(0, Math.min(indicatorTop, maxTop));

    viewportIndicator.style.height = `${indicatorHeight}px`;
    viewportIndicator.style.top = `${clampedTop}px`;

    // Update active items - highlight headers that are visible in viewport
    document.querySelectorAll(".minimap-item").forEach((row) => {
      const itemId = row.dataset.section;
      const element = document.getElementById(itemId);
      if (!element) {
        row.classList.remove("active");
        return;
      }

      // Get the actual header element
      const header =
        element.tagName === "H2" || element.tagName === "H3"
          ? element
          : element.querySelector("h2") ||
            element.querySelector("h3") ||
            element;

      const rect = header.getBoundingClientRect();
      const isActive = rect.top < viewportHeight && rect.bottom > 0;
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

          // Add highlight after scroll - POLL until visible
          let attempts = 0;
          const maxAttempts = 180; // Approx 3 seconds at 60fps

          const checkScrollEnd = () => {
            const rect = target.getBoundingClientRect();
            // Check if target is at least partially in view
            const isVisible = !(
              rect.bottom < 0 || rect.top > window.innerHeight
            );

            if (isVisible) {
              target.classList.add("highlighted");
              if (returnToReading) {
                returnToReading.href = `#${lastClickedCitation}`;
                returnToReading.classList.add("visible");
              }
            } else {
              attempts++;
              if (attempts < maxAttempts) {
                // Still scrolling? Check again.
                requestAnimationFrame(checkScrollEnd);
              }
            }
          };

          // Start polling
          requestAnimationFrame(checkScrollEnd);
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

  // ===== MOBILE METADATA TOGGLE =====
  function setupMetaToggle() {
    const toggle = document.querySelector(".hero-meta-toggle");
    const meta = document.querySelector(".hero-meta");

    if (toggle && meta) {
      toggle.addEventListener("click", function () {
        const isExpanded = meta.classList.toggle("expanded");
        toggle.textContent = isExpanded
          ? "Hide Report Details"
          : "Show Report Details";
      });
    }
  }

  // ===== HERO SCROLL INDICATOR =====
  function setupScrollIndicator() {
    const indicator = document.querySelector(".scroll-indicator");
    if (!indicator) return;

    indicator.addEventListener("click", function () {
      // Find the next significant element. Usually .toc or first .section
      // In the HTML structure, .toc follows .hero, or .scorecard-banner
      const hero = document.querySelector(".hero");
      let nextSection = hero.nextElementSibling;

      if (nextSection) {
        // Adjust for fixed nav if needed, though series-nav is the only fixed one
        // and it's small.
        const offset = 80;
        window.scrollTo({
          top: nextSection.offsetTop - offset,
          behavior: "smooth",
        });
      }
    });
  }

  // ===== AUDIO PLAYER =====
  function setupAudioPlayer() {
    const audio = document.getElementById("audio");
    if (!audio) return;

    const playBtn = document.getElementById("playBtn");
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");
    const seekSlider = document.getElementById("seekSlider");
    const currTime = document.getElementById("currTime");
    const durTime = document.getElementById("durTime");
    const rwBtn = document.getElementById("rwBtn");
    const ffBtn = document.getElementById("ffBtn");

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    function updateSliderBackground(value) {
      if (!seekSlider) return;
      const percentage = value || 0;
      // This creates a gradient: Accent Color up to X%, Gray after X%
      seekSlider.style.background = `linear-gradient(to right, var(--color-accent) ${percentage}%, #e5e7eb ${percentage}%)`;
    }

    // Toggle Play/Pause
    playBtn?.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      } else {
        audio.pause();
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      }
    });

    // Update Slider & Time as audio plays
    audio.addEventListener("timeupdate", () => {
      const current = audio.currentTime;
      const duration = audio.duration;

      if (duration && seekSlider) {
        const percentage = (current / duration) * 100;
        seekSlider.value = percentage;
        updateSliderBackground(percentage);
      }

      if (currTime) currTime.textContent = formatTime(current);
      if (durTime && duration) {
        durTime.textContent = "-" + formatTime(duration - current);
      }
    });

    // Seek functionality
    seekSlider?.addEventListener("input", () => {
      if (audio.duration) {
        audio.currentTime = (seekSlider.value / 100) * audio.duration;
      }
    });

    // Rewind / Fast Forward
    rwBtn?.addEventListener("click", () => {
      audio.currentTime = Math.max(0, audio.currentTime - 15);
    });

    ffBtn?.addEventListener("click", () => {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
    });

    // Set initial duration
    audio.addEventListener("loadedmetadata", () => {
      if (durTime) durTime.textContent = "-" + formatTime(audio.duration);
    });
  }

  // ===== THEME TOGGLE =====
  function setupTheme() {
    const toggle = document.getElementById("themeToggle");
    const storedTheme = localStorage.getItem("theme");
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
          localStorage.setItem("theme", "light");
        } else {
          document.documentElement.setAttribute("data-theme", "dark");
          localStorage.setItem("theme", "dark");
        }
      });
    }
  }

  // ===== MOBILE TOC =====
  function setupMobileToc() {
    const btn = document.getElementById("mobileTocBtn");
    const overlay = document.getElementById("mobileTocOverlay");
    const closeBtn = document.getElementById("closeMobileTocBtn");
    const contentContainer = document.getElementById("mobileTocContent");
    const originalTocList = document.querySelector(".toc-list");

    if (!btn || !overlay || !closeBtn || !contentContainer || !originalTocList)
      return;

    // Clone TOC content
    const clonedList = originalTocList.cloneNode(true);
    contentContainer.appendChild(clonedList);

    // Add click listeners to links to close overlay
    clonedList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        overlay.classList.remove("visible");
      });
    });

    btn.addEventListener("click", () => {
      overlay.classList.add("visible");
    });

    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("visible");
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
    setupTheme();
    initMinimap();
    setupCitations();
    setupReturnToReading();
    setupMinimapNavigation();
    setupTocNavigation();
    setupMetaToggle();
    setupScrollIndicator();
    setupAudioPlayer();
    setupMobileToc();
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
