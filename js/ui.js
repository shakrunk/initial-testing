// ===== UI COMPONENTS =====
import { showToast } from "./utils.js";

export function setupHeadingLinks() {
  const content = document.querySelector(".content");
  if (!content) return;

  function enhanceHeading(heading, id) {
    if (!heading || !id) return;

    const span = document.createElement("span");
    span.className = "heading-text";

    while (heading.firstChild) {
      span.appendChild(heading.firstChild);
    }
    heading.appendChild(span);

    const anchor = document.createElement("a");
    anchor.href = `#${id}`;
    anchor.className = "heading-anchor";
    anchor.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    `;
    anchor.ariaLabel = "Link to this section";
    heading.appendChild(anchor);
  }

  content.querySelectorAll(".section").forEach((section) => {
    const h2 = section.querySelector("h2");
    if (h2 && section.id) {
      enhanceHeading(h2, section.id);
    }
  });

  content.querySelectorAll("h3").forEach((h3) => {
    if (h3.id) {
      enhanceHeading(h3, h3.id);
    }
  });
}

export function setupSelectionMenu() {
  const menu = document.createElement("div");
  menu.className = "selection-menu";
  menu.id = "selectionMenu";

  const actions = [
    {
      id: "btnCopyText",
      label: "Copy",
      ariaLabel: "Copy Text",
      icon: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
      handler: () => {
        const selection = window.getSelection();
        const text = selection.toString();
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            showToast("Copied to clipboard!");
            menu.classList.remove("visible");
            selection.removeAllRanges();
          });
        }
      },
    },
    {
      id: "btnCopyLink",
      label: "Link",
      ariaLabel: "Copy Link to Highlight",
      icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
      handler: () => {
        const selection = window.getSelection();
        const text = selection.toString();
        if (text) {
          const encodedText = encodeURIComponent(text).replace(/-/g, "%2D");
          const url = `${window.location.origin}${window.location.pathname}#:~:text=${encodedText}`;
          navigator.clipboard.writeText(url).then(() => {
            showToast("Link copied to clipboard!");
            menu.classList.remove("visible");
            selection.removeAllRanges();
          });
        }
      },
    },
  ];

  actions.forEach((action, index) => {
    const btn = document.createElement("button");
    btn.className = "selection-btn";
    btn.id = action.id;
    btn.setAttribute("aria-label", action.ariaLabel);
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${action.icon}</svg> ${action.label}`;

    btn.addEventListener("click", action.handler);
    menu.appendChild(btn);

    if (index < actions.length - 1) {
      const divider = document.createElement("div");
      divider.className = "selection-divider";
      menu.appendChild(divider);
    }
  });

  document.body.appendChild(menu);

  function handleSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      let left = rect.left + rect.width / 2 - menu.offsetWidth / 2;
      left = Math.max(10, Math.min(left, window.innerWidth - menu.offsetWidth - 10));

      let top = rect.top - menu.offsetHeight - 10;
      if (top < 0) {
        top = rect.bottom + 10;
      }

      menu.style.left = `${left + window.scrollX}px`;
      menu.style.top = `${top + window.scrollY}px`;
      menu.classList.add("visible");
    } else {
      menu.classList.remove("visible");
    }
  }

  let debounceTimer;
  document.addEventListener("selectionchange", () => {
    clearTimeout(debounceTimer);
    if (window.getSelection().isCollapsed) {
      menu.classList.remove("visible");
    }
    debounceTimer = setTimeout(() => {}, 500);
  });

  document.addEventListener("mouseup", (e) => {
    if (menu.contains(e.target)) return;
    setTimeout(handleSelection, 10);
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "Shift" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      setTimeout(handleSelection, 10);
    }
  });

  window.addEventListener("scroll", () => {
    if (menu.classList.contains("visible")) {
      menu.classList.remove("visible");
    }
  }, { passive: true });
}

export function setupMobileToc() {
  const btn = document.getElementById("mobileTocBtn");
  const overlay = document.getElementById("mobileTocOverlay");
  const closeBtn = document.getElementById("closeMobileTocBtn");
  const contentContainer = document.getElementById("mobileTocContent");
  const originalTocList = document.querySelector(".toc-list");

  if (!btn || !overlay || !closeBtn || !contentContainer || !originalTocList)
    return;

  const clonedList = originalTocList.cloneNode(true);
  contentContainer.appendChild(clonedList);

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

export function setupMetaToggle() {
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

export function setupScrollIndicator() {
  const indicator = document.querySelector(".scroll-indicator");
  if (!indicator) return;

  indicator.addEventListener("click", function () {
    const hero = document.querySelector(".hero");
    let nextSection = hero.nextElementSibling;

    if (nextSection) {
      const offset = 80;
      window.scrollTo({
        top: nextSection.offsetTop - offset,
        behavior: "smooth",
      });
    }
  });
}

export function setupTocNavigation() {
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
