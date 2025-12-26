# Palette's Journal

## 2025-05-18 - Audio Loading States
**Learning:** Users can be confused by the immediate icon swap on audio players ("Play" -> "Pause") before the audio actually starts, especially on slow connections.
**Action:** Use the `waiting` and `playing` media events to manage a specific "loading" state (spinner) instead of blindly toggling icons on click.
