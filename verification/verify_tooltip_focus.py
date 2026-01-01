from playwright.sync_api import sync_playwright, expect
import time

def test_tooltip_focus():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to the page
        page.goto("http://localhost:8080/articles/flawed-democracy.html")

        # Wait for citations to be initialized
        page.wait_for_timeout(1000)

        # Find the first citation link
        citation_link = page.locator("sup a").first

        # Focus the link
        citation_link.focus()

        # Wait for tooltip delay (500ms in code + buffer)
        page.wait_for_timeout(1000)

        # Take screenshot of the tooltip area
        # We need to capture where the tooltip appears.
        # The tooltip is fixed positioned based on the element.
        # Let's just screenshot the viewport
        page.screenshot(path="verification/tooltip_focus.png")

        # Verify tooltip is visible
        tooltip = page.locator("#citationTooltip")
        expect(tooltip).to_be_visible()

        print("Tooltip verified visible on focus")

        browser.close()

if __name__ == "__main__":
    test_tooltip_focus()
