(function() {
    "use strict";

    function createGlobalNav() {
        // Create Nav Element
        const nav = document.createElement("nav");
        nav.id = "global-nav";
        nav.setAttribute("aria-label", "Global Site Navigation");

        // Create Container
        const container = document.createElement("div");
        container.className = "global-nav-inner";

        // Create Home Link/Logo
        const homeLink = document.createElement("a");
        homeLink.href = "index.html";
        homeLink.className = "global-nav-logo";
        homeLink.textContent = "The Archive";

        // Create Links Group
        const linksGroup = document.createElement("div");
        linksGroup.className = "global-nav-links";

        // Article Links
        const links = [
            { text: "Part I: Flawed Democracy", href: "flawed-democracy.html" },
            { text: "Part II: Grey Zone", href: "twilight-of-the-grey-zone.html" },
            { text: "Lottery Analysis", href: "lottery-ticket-analysis.html" }
        ];

        links.forEach(link => {
            const a = document.createElement("a");
            a.href = link.href;
            a.textContent = link.text;
            a.className = "global-nav-link";

            // Check active state
            const currentPath = window.location.pathname.split("/").pop();
            if (currentPath === link.href) {
                a.classList.add("active");
            }

            linksGroup.appendChild(a);
        });

        // Assemble
        container.appendChild(homeLink);
        container.appendChild(linksGroup);
        nav.appendChild(container);

        // Inject
        document.body.prepend(nav);
    }

    // Run on load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createGlobalNav);
    } else {
        createGlobalNav();
    }
})();
