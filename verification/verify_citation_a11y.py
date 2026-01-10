from playwright.sync_api import sync_playwright
import time
import sys

def verify_citation_a11y():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Start server in background if not already running (assuming user handles this or I run it separately)
        # For this script, I'll assume the server is running on port 8000 as per memory
        try:
            page.goto("http://localhost:8000/articles/twilight-of-the-grey-zone.html")
        except Exception as e:
            print("Error connecting to server. Make sure python3 -m http.server is running.")
            sys.exit(1)

        # Wait for citations to be set up
        page.wait_for_selector("sup a[data-citation]")

        # Get the first citation link
        citation_link = page.locator("sup a[data-citation]").first

        # Focus the link
        citation_link.focus()

        # Wait for tooltip to appear (it has a 500ms debounce)
        page.wait_for_timeout(1000)

        # Check if tooltip has role="tooltip"
        tooltip = page.locator("#citationTooltip")
        role = tooltip.get_attribute("role")
        aria_hidden = tooltip.get_attribute("aria-hidden")

        print(f"Tooltip role: {role}")
        print(f"Tooltip aria-hidden: {aria_hidden}")

        # Check if link has aria-describedby
        described_by = citation_link.get_attribute("aria-describedby")
        print(f"Link aria-describedby: {described_by}")

        # Validation
        if role != "tooltip":
            print("FAIL: Tooltip missing role='tooltip'")
        if described_by != "citationTooltip":
            print("FAIL: Link missing aria-describedby='citationTooltip'")

        browser.close()

if __name__ == "__main__":
    verify_citation_a11y()
