## 2025-05-18 - Audio Loading States
**Learning:** Users can be confused by the immediate icon swap on audio players ("Play" -> "Pause") before the audio actually starts, especially on slow connections.
**Action:** Use the `waiting` and `playing` media events to manage a specific "loading" state (spinner) instead of blindly toggling icons on click.

## 2025-05-18 - Keyboard Event Handling in Composite Widgets
**Learning:** Attaching global keyboard shortcuts to a container element can hijack accessibility of interactive children (like buttons and sliders) if `preventDefault()` is called indiscriminately.
**Action:** Use `e.target` checks to ensure shortcuts like Space or Arrows only trigger when they don't conflict with the focused element's native behavior.

## 2025-05-20 - Dynamic Accessibility State Sync
**Learning:** For dynamic components like the Mini Player that sync state with a parent component (main audio player), it is critical to ensure `aria-label` and `title` attributes are updated alongside visual icons (e.g., Play/Pause) to prevent screen readers from announcing stale state.
**Action:** Always pair `setButtonIcon` or visual updates with `setAttribute('aria-label', ...)` in state change event listeners (`play`, `pause`).
