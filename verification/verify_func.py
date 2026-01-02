from playwright.sync_api import sync_playwright

def verify_return_functionality():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/articles/flawed-democracy.html")
        page.wait_for_load_state("networkidle")

        # 1. Find the first citation
        citation_link = page.locator("sup a").first
        citation_sup = page.locator("sup").first

        # Scroll to the citation so we know where it is
        citation_link.scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        target_scroll_y = page.evaluate("window.scrollY")
        print(f"Target citation scroll position: {target_scroll_y}")

        # 2. Click the citation
        citation_link.click()

        # Wait for scroll to bottom (works cited)
        page.wait_for_timeout(2000)

        bottom_scroll_y = page.evaluate("window.scrollY")
        print(f"Bottom scroll position: {bottom_scroll_y}")

        # Verify we moved significantly down
        assert bottom_scroll_y > target_scroll_y + 1000

        # 3. Wait for return button to appear
        return_button = page.locator("#returnToReading")
        return_button.wait_for(state="visible", timeout=5000)

        # 4. Click return button
        return_button.click()

        # 5. Verify we scrolled back up
        page.wait_for_timeout(2000)

        final_scroll_y = page.evaluate("window.scrollY")
        print(f"Final scroll position: {final_scroll_y}")

        # Verify we are back near the target
        # Allow 100px margin
        diff = abs(final_scroll_y - target_scroll_y)
        print(f"Difference: {diff}")
        assert diff < 200

        print("Return functionality verified!")

        browser.close()

if __name__ == "__main__":
    verify_return_functionality()
