## 2025-05-18 - Audio Loading States
**Learning:** Users can be confused by the immediate icon swap on audio players ("Play" -> "Pause") before the audio actually starts, especially on slow connections.
**Action:** Use the `waiting` and `playing` media events to manage a specific "loading" state (spinner) instead of blindly toggling icons on click.

## 2025-05-18 - Keyboard Event Handling in Composite Widgets
**Learning:** Attaching global keyboard shortcuts to a container element can hijack accessibility of interactive children (like buttons and sliders) if `preventDefault()` is called indiscriminately.
**Action:** Use `e.target` checks to ensure shortcuts like Space or Arrows only trigger when they don't conflict with the focused element's native behavior.

## 2026-01-21 - Proactive UI Validation
**Learning:** Users find it frustrating to perform an action (like selecting text for a link) only to be told it's invalid via an error toast.
**Action:** Proactively disable UI elements (e.g., the "Link" button) when the state is invalid (selection > 500 chars) and provide explanation via tooltip.
