from playwright.sync_api import sync_playwright
import time

def verify_and_capture_tooltip():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/articles/flawed-democracy.html")

        # Find a citation
        citation_link = page.locator("sup a").first

        # Hover over citation to show tooltip
        citation_link.hover()

        # Wait for tooltip to appear and become visible (transition)
        tooltip = page.locator("#citationTooltip")
        tooltip.wait_for(state="visible", timeout=2000)
        time.sleep(0.5) # Wait for transition

        # Move mouse to tooltip
        box = tooltip.bounding_box()
        if box:
            page.mouse.move(box['x'] + 10, box['y'] + 10)
            time.sleep(1.0) # Wait to ensure it stays open

        # Take screenshot of the tooltip area
        # We'll take a screenshot of the whole viewport to see context
        page.screenshot(path="verification/citation_tooltip_interactive.png")
        print("Screenshot saved to verification/citation_tooltip_interactive.png")

        browser.close()

if __name__ == "__main__":
    verify_and_capture_tooltip()
