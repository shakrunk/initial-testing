from playwright.sync_api import sync_playwright

def verify_return_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/articles/flawed-democracy.html")

        # Click a citation to trigger the "Return to Reading" button
        # The citations are inside <sup> tags.
        citation_link = page.locator("sup a").first
        citation_link.click()

        # Wait for the button to appear
        return_button = page.locator("#returnToReading")
        return_button.wait_for(state="visible", timeout=5000)

        # Verify it is a button tag
        tag_name = return_button.evaluate("el => el.tagName")
        print(f"Tag name: {tag_name}")
        assert tag_name == "BUTTON"

        # Verify it is clickable
        assert return_button.is_visible()

        # Take screenshot
        page.screenshot(path="verification/return_button.png")
        print("Screenshot saved to verification/return_button.png")

        browser.close()

if __name__ == "__main__":
    verify_return_button()
