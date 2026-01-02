(function () {
  "use strict";

  function createGlobalNav() {
    // Create Nav Element
    const nav = document.createElement("nav");
    nav.id = "global-nav";
    nav.setAttribute("aria-label", "Global Site Navigation");

    // Create Container
    const container = document.createElement("div");
    container.className = "global-nav-inner";

    // Determine Path Context
    const path = window.location.pathname;
    const isArticlePage = path.includes("/articles/");

    // Define prefixes based on context
    const homePrefix = isArticlePage ? "../" : "./";
    const articlePrefix = isArticlePage ? "" : "articles/";

    // Create Home Link/Logo
    const homeLink = document.createElement("a");
    homeLink.href = `${homePrefix}index.html`;
    homeLink.className = "global-nav-logo";
    homeLink.textContent = "Let's Double Check";

    // Check if Home is active
    if (path.endsWith("index.html") || path.endsWith("/")) {
        homeLink.setAttribute("aria-current", "page");
    }

    // Create Links Group
    const linksGroup = document.createElement("div");
    linksGroup.className = "global-nav-links";

    // Article Links
    const links = [
      { text: "Part I: Flawed Democracy", filename: "flawed-democracy.html" },
      { text: "Part II: Grey Zone", filename: "twilight-of-the-grey-zone.html" },
      { text: "Lottery Analysis", filename: "lottery-ticket-analysis.html" },
    ];

    links.forEach((link) => {
      const a = document.createElement("a");
      a.href = `${articlePrefix}${link.filename}`;
      a.textContent = link.text;
      a.className = "global-nav-link";

      // Check active state
      // We check if the current path ends with the filename
      if (path.endsWith(link.filename)) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }

      linksGroup.appendChild(a);
    });

    // Assemble
    container.appendChild(homeLink);
    container.appendChild(linksGroup);
    nav.appendChild(container);

    // Inject
    // Ensure skip-link stays first if it exists
    const skipLink = document.querySelector(".skip-to-content");
    if (skipLink) {
      // Insert after skip link
      skipLink.insertAdjacentElement("afterend", nav);
    } else {
      // Fallback
      document.body.prepend(nav);
    }
  }

  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createGlobalNav);
  } else {
    createGlobalNav();
  }
})();
