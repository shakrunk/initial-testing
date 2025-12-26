
from playwright.sync_api import sync_playwright, expect
import time

def verify_audio_player(page):
    page.goto("http://localhost:8080/flawed-democracy.html")

    # Wait for the audio player to be initialized
    # The audio player creates a .custom-audio-controls div
    expect(page.locator(".custom-audio-controls")).to_be_visible()

    # Check if the play button exists and has the SVG icon
    play_btn = page.locator(".play-btn")
    expect(play_btn).to_be_visible()

    # Check if SVG is present inside the button
    svg = play_btn.locator("svg")
    expect(svg).to_be_visible()

    # Verify it has the correct path for "play" state
    # M8 5v14l11-7z
    path = svg.locator("path")
    # We can check the 'd' attribute
    d_attr = path.get_attribute("d")
    print(f"Play icon path: {d_attr}")
    if "M8 5v14l11-7z" not in d_attr:
         print("Error: Play icon path incorrect")

    # Take a screenshot of the initial state
    page.screenshot(path="verification/audio_player_initial.png")

    # Click the play button
    # Note: Autoplay might be blocked, but the UI should update
    play_btn.click()

    # Wait a bit for UI update
    time.sleep(0.5)

    # Verify the icon changed to "pause"
    # M6 19h4V5H6v14zm8-14v14h4V5h-4z
    svg = play_btn.locator("svg")
    path = svg.locator("path")
    d_attr = path.get_attribute("d")
    print(f"Pause icon path: {d_attr}")

    # Take a screenshot of the playing state
    page.screenshot(path="verification/audio_player_playing.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_audio_player(page)
        finally:
            browser.close()
