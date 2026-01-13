from playwright.sync_api import sync_playwright

def verify_storage_and_audio(page):
    # Navigate to an article that has the audio player
    page.goto("http://localhost:8080/articles/flawed-democracy.html")

    # Wait for the page to load
    page.wait_for_load_state("networkidle")

    # 1. Verify Audio Player Initialization (which depends on audio-player.js being loaded as module)
    # The custom controls are created by initAudioPlayers in audio-player.js
    custom_controls = page.locator(".custom-audio-controls")
    custom_controls.wait_for(state="visible", timeout=5000)
    print("Audio player controls visible.")

    # 2. Verify Theme Toggle (uses theme.js which uses safeStorage)
    theme_toggle = page.locator(".theme-toggle").first
    theme_toggle.click()

    # Check if theme attribute is applied
    page.wait_for_function("document.documentElement.getAttribute('data-theme') === 'dark'")
    print("Theme toggle works (Dark mode applied).")

    # Take screenshot
    page.screenshot(path="verification/verification.png")
    print("Screenshot taken.")

    # 3. Test safeStorage robustness (Mock localStorage failure)
    # Reload page with localStorage mocked to throw error
    page.add_init_script("""
    Object.defineProperty(window, 'localStorage', {
        get: function() {
            throw new Error('SecurityError: Access is denied for this document.');
        }
    });
    """)
    page.reload()
    page.wait_for_load_state("networkidle")

    # Check if page still functions without crashing
    # Audio player should still initialize (visual check via locator)
    custom_controls = page.locator(".custom-audio-controls")
    custom_controls.wait_for(state="visible", timeout=5000)
    print("Audio player initialized even with localStorage error.")

    # Theme toggle should not crash
    theme_toggle = page.locator(".theme-toggle").first
    theme_toggle.click()
    # It won't persist, but it shouldn't crash script execution
    print("Theme toggle clicked with localStorage error (no crash).")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_storage_and_audio(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            exit(1)
        finally:
            browser.close()
