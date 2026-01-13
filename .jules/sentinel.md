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

## 2025-12-25 - [Refactor Audio Player for Safe DOM Manipulation]
**Vulnerability:** Usage of `innerHTML` to update SVG icons in the audio player. While the content was static, this pattern increases the attack surface and can mask accidental introduction of dynamic, untrusted content in the future.
**Learning:** Consistent use of DOM APIs (`createElementNS`, `setAttribute`) for SVG manipulation eliminates the need for `innerHTML` entirely in UI components, enforcing a stricter security posture.
**Prevention:** Refactored `audio-player.js` to use `createElementNS` for all SVG icon updates.

## 2025-12-26 - [Add Referrer Policy]
**Vulnerability:** Missing Referrer-Policy header allows the browser to send the full URL (including path and query parameters) as the Referer header when navigating to external links (e.g., citations). This can leak user activity and specific article context to third-party sites.
**Learning:** Privacy and security are intertwined. While not a direct exploit, leaking browsing history via Referer headers increases the attack surface for users.
**Prevention:** Added `<meta name="referrer" content="strict-origin-when-cross-origin" />` to all HTML pages to ensure only the origin is sent to cross-origin destinations.

## 2025-12-31 - [Implement Strict Referrer Policy]
**Vulnerability:** The absence of a Referrer Policy allows browsers to send the full URL (including path and query parameters) in the `Referer` header to cross-origin destinations. This can leak sensitive path information or user activity patterns to third-party analytics or external links.
**Learning:** For static sites with no backend to strip headers, the `<meta name="referrer">` tag is the primary defense for controlling information leakage.
**Prevention:** Added `<meta name="referrer" content="strict-origin-when-cross-origin" />` to all HTML files. This ensures that cross-origin requests only receive the origin (e.g., `https://example.com/`) while same-origin requests maintain full context.

## 2025-01-01 - [Defensive Storage Access]
**Vulnerability:** Direct access to `localStorage` in `js/theme.js` and `js/audio-player.js` without error handling causes application crashes in privacy-enhanced environments (e.g., Incognito mode, disabled third-party cookies) where `SecurityError` is thrown.
**Learning:** Web APIs that persist data (like `localStorage` or `sessionStorage`) are not guaranteed to be available or writable. Assuming their availability violates the principle of "failing securely" (or gracefully) and can lead to denial of service for privacy-conscious users.
**Prevention:** Implemented a `safeStorage` wrapper in `js/utils.js` that wraps all storage operations in `try-catch` blocks, ensuring the application degrades gracefully when storage is restricted.
