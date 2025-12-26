from playwright.sync_api import sync_playwright
import os

def verify_global_nav():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Verify Home Page
        page = browser.new_page()
        # Use file:// protocol to access local files
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Wait for nav injection
        page.wait_for_selector("#global-nav")

        # Take screenshot of home
        page.screenshot(path="verification/home.png")
        print("Home screenshot taken.")

        # 2. Verify Part I (Flawed Democracy)
        page.goto(f"file://{cwd}/flawed-democracy.html")
        page.wait_for_selector("#global-nav")

        # Check active state
        # The URL in file:// protocol might be tricky for strict equality in JS logic
        # (pathname might be full path), so we just check visibility for now.
        # But we can screenshot to see if "Part I" is highlighted (if our JS logic handles file:// paths correctly)

        page.screenshot(path="verification/part1.png")
        print("Part I screenshot taken.")

        # 3. Verify Part II (Grey Zone)
        page.goto(f"file://{cwd}/twilight-of-the-grey-zone.html")
        page.wait_for_selector("#global-nav")

        # Check if Series Nav is visible below Global Nav
        # Series nav has class .series-nav.
        # We want to verify no overlap.

        page.screenshot(path="verification/part2.png")
        print("Part II screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_global_nav()
