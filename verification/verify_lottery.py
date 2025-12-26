from playwright.sync_api import sync_playwright
import os
import time

def verify_lottery_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()
        cwd = os.getcwd()

        # 1. Verify Home Page has new card
        page.goto(f"file://{cwd}/index.html")
        page.wait_for_selector("a[href=\"lottery-ticket-analysis.html\"]")
        time.sleep(1) # Wait for any grid transitions
        page.screenshot(path="verification/home_updated.png")
        print("Home updated screenshot taken.")

        # 2. Verify Lottery Page renders
        page.goto(f"file://{cwd}/lottery-ticket-analysis.html")
        page.wait_for_selector("#global-nav")

        # Check title
        title = page.title()
        assert "Lottery Participation" in title, f"Title mismatch: {title}"

        # Check nav link exists
        page.wait_for_selector("a[href=\"lottery-ticket-analysis.html\"].active")

        # Wait for animations (hero text fades in)
        print("Waiting for animations...")
        time.sleep(3)

        page.screenshot(path="verification/lottery_page.png")
        print("Lottery page screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_lottery_page()
