// ===== UI COMPONENTS =====
import { showToast } from "./utils.js";
import { createSvgIcon } from "./icons.js";

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
    anchor.appendChild(createSvgIcon("link"));
    anchor.ariaLabel = "Link to this section";
    anchor.title = "Link to this section";
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
      iconName: "copy",
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
      iconName: "link",
      handler: () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text && text.length <= 500) {
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

    btn.appendChild(createSvgIcon(action.iconName));
    btn.appendChild(document.createTextNode(" " + action.label));

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
      // Proactively disable link button if too long
      const btnLink = menu.querySelector("#btnCopyLink");
      if (btnLink) {
        if (text.length > 500) {
          btnLink.disabled = true;
          btnLink.title = "Selection too long for link (max 500 chars)";
        } else {
          btnLink.disabled = false;
          btnLink.title = "";
        }
      }

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

  // Enhance accessibility
  if (!indicator.hasAttribute("role")) indicator.setAttribute("role", "button");
  if (!indicator.hasAttribute("tabindex")) indicator.setAttribute("tabindex", "0");
  if (!indicator.hasAttribute("aria-label"))
    indicator.setAttribute("aria-label", "Scroll to next section");

  const scrollToNext = () => {
    const hero = document.querySelector(".hero");
    const nextSection = hero.nextElementSibling;

    if (nextSection) {
      const offset = 80;
      window.scrollTo({
        top: nextSection.offsetTop - offset,
        behavior: "smooth",
      });
    }
  };

  indicator.addEventListener("click", scrollToNext);

  // Keyboard accessibility
  indicator.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToNext();
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
