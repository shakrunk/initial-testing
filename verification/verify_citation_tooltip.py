from playwright.sync_api import sync_playwright
import time

def verify_citation_tooltip():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/articles/flawed-democracy.html")

        # Find a citation
        citation_link = page.locator("sup a").first

        print("Hovering over citation...")
        citation_link.hover()

        # Wait for tooltip to appear
        tooltip = page.locator("#citationTooltip")
        try:
            tooltip.wait_for(state="visible", timeout=2000)
            print("Tooltip appeared.")
        except:
            print("Tooltip did not appear.")
            return

        # Check pointer-events style
        pointer_events = tooltip.evaluate("el => getComputedStyle(el).pointerEvents")
        print(f"Tooltip pointer-events: {pointer_events}")

        # Check if we can interact with it (logic check only, verifying improvement needs change first)
        if pointer_events == 'none':
            print("Tooltip is not interactive (as expected before fix).")
        else:
            print("Tooltip IS interactive.")

        # Test hover bridge behavior (simulated)
        # Move mouse to tooltip
        box = tooltip.bounding_box()
        if box:
            print(f"Moving mouse to tooltip at {box['x'] + 10}, {box['y'] + 10}")
            page.mouse.move(box['x'] + 10, box['y'] + 10)
            time.sleep(1.0) # Wait 1s, transition is 0.25s

            # Check if still visible
            # Note: is_visible() checks for display:none, visibility:hidden, opacity:0
            # If opacity is 0, it returns False.
            if tooltip.is_visible():
                opacity = tooltip.evaluate("el => getComputedStyle(el).opacity")
                print(f"Tooltip stayed visible. Opacity: {opacity}")
            else:
                print("Tooltip disappeared (is_visible() = False).")

        browser.close()

if __name__ == "__main__":
    verify_citation_tooltip()
