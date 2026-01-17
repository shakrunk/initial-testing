## 2025-05-18 - Audio Loading States
**Learning:** Users can be confused by the immediate icon swap on audio players ("Play" -> "Pause") before the audio actually starts, especially on slow connections.
**Action:** Use the `waiting` and `playing` media events to manage a specific "loading" state (spinner) instead of blindly toggling icons on click.

## 2025-05-18 - Keyboard Event Handling in Composite Widgets
**Learning:** Attaching global keyboard shortcuts to a container element can hijack accessibility of interactive children (like buttons and sliders) if `preventDefault()` is called indiscriminately.
**Action:** Use `e.target` checks to ensure shortcuts like Space or Arrows only trigger when they don't conflict with the focused element's native behavior.

## 2025-05-18 - Ghost Focus on Invisible Elements
**Learning:** Elements hidden only with `opacity: 0` remain in the tab order, creating "ghost focus" stops where users lose track of their position.
**Action:** Always pair `opacity: 0` with `visibility: hidden` (and `pointer-events: none`) for elements that should be removed from the accessibility tree, using `transition` to handle the animation gracefully.
