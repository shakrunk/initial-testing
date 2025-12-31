## 2025-12-31 - [Implement Strict Referrer Policy]
**Vulnerability:** The absence of a Referrer Policy allows browsers to send the full URL (including path and query parameters) in the `Referer` header to cross-origin destinations. This can leak sensitive path information or user activity patterns to third-party analytics or external links.
**Learning:** For static sites with no backend to strip headers, the `<meta name="referrer">` tag is the primary defense for controlling information leakage.
**Prevention:** Added `<meta name="referrer" content="strict-origin-when-cross-origin" />` to all HTML files. This ensures that cross-origin requests only receive the origin (e.g., `https://example.com/`) while same-origin requests maintain full context.
