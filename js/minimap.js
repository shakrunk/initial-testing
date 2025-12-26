// ===== MINIMAP & TOC DATA =====

// Automatically detect sections and subheadings from the DOM
export function buildTocData() {
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

export function initMinimap() {
  const minimapItems = document.getElementById("minimapItems");
  if (!minimapItems) return;

  const tocData = buildTocData();
  if (tocData.length === 0) return;

  minimapItems.innerHTML = "";

  const contentElement = document.querySelector(".content");
  const worksCitedElement = document.querySelector(".works-cited");
  if (!contentElement) return;

  // Helper: Get Y position relative to the entire document
  const getPageY = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top + window.scrollY;
  };

  // Calculate total boundaries
  const contentTop = getPageY(contentElement);
  const contentBottom = worksCitedElement
    ? getPageY(worksCitedElement) + worksCitedElement.offsetHeight
    : contentTop + contentElement.offsetHeight;

  tocData.forEach((item, index) => {
    const element = item.element || document.getElementById(item.id);
    if (!element) return;

    const itemTop = index === 0 ? contentTop : getPageY(element);

    let nextTop;
    if (index < tocData.length - 1) {
      const nextItem = tocData[index + 1];
      const nextElement =
        nextItem.element || document.getElementById(nextItem.id);
      nextTop = getPageY(nextElement);
    } else {
      nextTop = contentBottom;
    }

    let itemHeight = nextTop - itemTop;
    itemHeight = Math.max(itemHeight, 0);

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

export function updateViewportIndicator() {
  const viewportIndicator = document.getElementById("viewportIndicator");
  const minimapItems = document.getElementById("minimapItems");

  if (!viewportIndicator || !minimapItems) return;

  const contentElement = document.querySelector(".content");
  const worksCited = document.querySelector(".works-cited");
  if (!contentElement) return;

  const viewportHeight = window.innerHeight;
  const contentTop = contentElement.offsetTop;

  const contentBottom = worksCited
    ? worksCited.offsetTop + worksCited.offsetHeight
    : contentElement.offsetTop + contentElement.offsetHeight;

  const contentHeight = contentBottom - contentTop;
  const trackHeight = minimapItems.offsetHeight;

  const scale = trackHeight / contentHeight;

  let indicatorHeight = viewportHeight * scale;
  indicatorHeight = Math.max(indicatorHeight, 20);

  const scrollY = window.scrollY;
  const relativeScroll = scrollY - contentTop;
  const indicatorTop = relativeScroll * scale;

  const maxTop = trackHeight - indicatorHeight;
  const clampedTop = Math.max(0, Math.min(indicatorTop, maxTop));

  viewportIndicator.style.height = `${indicatorHeight}px`;
  viewportIndicator.style.top = `${clampedTop}px`;

  document.querySelectorAll(".minimap-item").forEach((row) => {
    const itemId = row.dataset.section;
    const element = document.getElementById(itemId);
    if (!element) {
      row.classList.remove("active");
      return;
    }

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

export function setupMinimapNavigation() {
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
