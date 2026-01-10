from playwright.sync_api import sync_playwright

def verify_tooltip_visual():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        try:
            page.goto("http://localhost:8000/articles/twilight-of-the-grey-zone.html")
        except Exception:
            print("Error connecting to server. Make sure python3 -m http.server is running.")
            return

        # Wait for citations to be set up
        page.wait_for_selector("sup a[data-citation]")

        # Get the first citation link
        citation_link = page.locator("sup a[data-citation]").first

        # Scroll it into view (center)
        citation_link.scroll_into_view_if_needed()

        # Focus the link to trigger tooltip
        citation_link.focus()

        # Wait for tooltip to appear (500ms debounce + animation)
        page.wait_for_timeout(1000)

        # Take screenshot
        page.screenshot(path="verification/tooltip_visible.png")
        print("Screenshot saved to verification/tooltip_visible.png")

        browser.close()

if __name__ == "__main__":
    verify_tooltip_visual()
