// ===== CITATION SYSTEM =====

export function setupCitations() {
  const citationTooltip = document.getElementById("citationTooltip");
  const returnToReading = document.getElementById("returnToReading");
  if (!citationTooltip) return;

  let hoverTimeout = null;

  // Find all sup elements and wrap content in links
  document.querySelectorAll("sup").forEach((sup) => {
    const text = sup.textContent.trim();
    const match = text.match(/^(\d+)$/);
    if (match) {
      const num = match[1];
      const citationId = `cite-${num}`;

      // Generate a secure random ID
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const randomPart = array[0].toString(36);
      const inlineId = `ref-${num}-${randomPart}`;

      sup.id = inlineId;

      if (!sup.querySelector("a")) {
        const a = document.createElement("a");
        a.href = `#${citationId}`;
        a.dataset.citation = num;
        a.dataset.return = inlineId;
        a.textContent = text;

        sup.textContent = "";
        sup.appendChild(a);
      }
    }
  });

  // Setup hover and focus tooltips
  document.querySelectorAll("sup a[data-citation]").forEach((link) => {
    const showTooltip = () => {
      clearTimeout(hoverTimeout);

      hoverTimeout = setTimeout(() => {
        const citationNum = link.dataset.citation;
        const citationEl = document.getElementById(`cite-${citationNum}`);
        if (!citationEl) return;

        const textEl = citationEl.querySelector(".citation-text");

        const header = citationTooltip.querySelector(
          ".citation-tooltip-header",
        );
        const body = citationTooltip.querySelector(".citation-tooltip-text");

        if (header) header.textContent = `Reference ${citationNum}`;
        if (body) {
          body.innerHTML = "";
          if (textEl) {
            textEl.childNodes.forEach((node) => {
              body.appendChild(node.cloneNode(true));
            });
          } else {
            body.textContent = citationEl.textContent;
          }
        }

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
      }, 500);
    };

    const hideTooltip = () => {
      clearTimeout(hoverTimeout);
      citationTooltip.classList.remove("visible");
    };

    link.addEventListener("mouseenter", showTooltip);
    link.addEventListener("focus", showTooltip);

    link.addEventListener("mouseleave", hideTooltip);
    link.addEventListener("blur", hideTooltip);

    link.addEventListener("click", function (e) {
      e.preventDefault();
      hideTooltip();

      // We need to store lastClickedCitation somewhere accessible or manage return button here
      // For modularity, we can attach it to the return button or a global state object
      // But keeping it simple:
      const returnBtn = document.getElementById("returnToReading");
      if(returnBtn) {
          returnBtn.dataset.lastReturnId = link.dataset.return;
      }

      const targetId = link.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        document
          .querySelectorAll(".citation-item.highlighted")
          .forEach((el) => {
            el.classList.remove("highlighted");
          });

        target.scrollIntoView({ behavior: "smooth", block: "center" });

        let attempts = 0;
        const maxAttempts = 180;

        const checkScrollEnd = () => {
          const rect = target.getBoundingClientRect();
          const isVisible = !(
            rect.bottom < 0 || rect.top > window.innerHeight
          );

          if (isVisible) {
            target.classList.add("highlighted");
            if (returnToReading) {
              // We set the href just for semantic reasons, the click handler uses dataset
              returnToReading.href = `#${link.dataset.return}`;
              returnToReading.classList.add("visible");
            }
          } else {
            attempts++;
            if (attempts < maxAttempts) {
              requestAnimationFrame(checkScrollEnd);
            }
          }
        };

        requestAnimationFrame(checkScrollEnd);
      }
    });
  });
}

export function setupReturnToReading() {
  const returnToReading = document.getElementById("returnToReading");
  if (!returnToReading) return;

  returnToReading.addEventListener("click", function (e) {
    e.preventDefault();

    const lastClickedId = this.dataset.lastReturnId;

    if (lastClickedId) {
      const returnTarget = document.getElementById(lastClickedId);
      if (returnTarget) {
        returnTarget.scrollIntoView({ behavior: "smooth", block: "center" });

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
  });
}

export function checkReturnButtonVisibility() {
  const returnToReading = document.getElementById("returnToReading");
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
