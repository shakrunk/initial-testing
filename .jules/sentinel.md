## 2025-12-22 - [Refactor initMinimap to prevent XSS]
**Vulnerability:** Potential DOM-based XSS in `scripts.js` where `innerHTML` was used to construct minimap items using `item.title`, which is derived from `h2.textContent`. While the source is currently static, unsafe DOM manipulation is a vulnerability pattern.
**Learning:** Even in static sites, avoiding `innerHTML` when handling variable content (like text derived from the DOM) is a critical defense-in-depth practice.
**Prevention:** Use `document.createElement` and `textContent` for text nodes instead of template literals with `innerHTML`.
