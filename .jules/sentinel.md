## 2025-12-22 - [Refactor initMinimap to prevent XSS]
**Vulnerability:** Potential DOM-based XSS in `scripts.js` where `innerHTML` was used to construct minimap items using `item.title`, which is derived from `h2.textContent`. While the source is currently static, unsafe DOM manipulation is a vulnerability pattern.
**Learning:** Even in static sites, avoiding `innerHTML` when handling variable content (like text derived from the DOM) is a critical defense-in-depth practice.
**Prevention:** Use `document.createElement` and `textContent` for text nodes instead of template literals with `innerHTML`.

## 2025-12-23 - [Add Content Security Policy]
**Vulnerability:** Missing Content Security Policy (CSP) headers, leaving the application vulnerable to XSS and Clickjacking attacks if a vulnerability were introduced.
**Learning:** For static sites, CSP is a low-effort, high-reward security layer. The challenge is handling inline styles and external fonts without making the policy too permissive.
**Prevention:** Added a `<meta>` tag with a strict CSP that allows `self` for scripts (blocking inline scripts) but permits `unsafe-inline` for styles (necessary for current architecture) and specific Google Font domains.

## 2025-12-24 - [Secure DOM Content Transfer]
**Vulnerability:** Transferring HTML content between elements using `innerHTML` (e.g., tooltips) creates a potential XSS vector if the source content is compromised or contains hidden malicious payloads that become active upon re-insertion.
**Learning:** `cloneNode(true)` and `appendChild` provide a safer way to move or copy rich text content within the DOM without the serialization/parsing risks of `innerHTML`.
**Prevention:** Replaced `innerHTML` assignment in citation tooltip logic with DOM node cloning.
