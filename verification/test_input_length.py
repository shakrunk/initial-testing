from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for clipboard access
        context = browser.new_context(
            permissions=["clipboard-read", "clipboard-write"]
        )
        page = context.new_page()

        # Load the article
        page.goto("http://localhost:8080/articles/flawed-democracy.html")

        # Wait for page readiness
        time.sleep(2)

        # Test 1: Short selection (Valid)
        print("Testing short selection...")
        # Select "Democratic Health Diagnostic Framework" title using evaluation to ensure clean selection
        page.evaluate("""
            const range = document.createRange();
            const node = document.querySelector("h1.hero-title");
            range.selectNodeContents(node);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        """)

        # Trigger the selection menu logic
        # We need to manually fire the event or wait for the poller
        # js/ui.js uses document.addEventListener("mouseup") and "keyup" to trigger handleSelection
        # It also listens to "selectionchange" but debounces it

        page.mouse.up() # Trigger mouseup to show menu
        time.sleep(1) # Wait for menu animation

        # Click Link button using force=True to bypass interception issues if any
        copy_link_btn = page.locator("#btnCopyLink")
        expect(copy_link_btn).to_be_visible()

        # Use force=True because sometimes the menu might be slightly obscured or moving
        copy_link_btn.click(force=True)

        # Check toast
        toast = page.locator("#toastNotification")
        expect(toast).to_be_visible()
        expect(toast).to_have_text("Link copied to clipboard!")
        print("Short selection: Success")

        # Wait for toast to disappear
        time.sleep(3)

        # Test 2: Long selection (Should be blocked after fix, currently allowed)
        print("Testing long selection...")

        # Select a large chunk of text.
        page.evaluate("""
            const range = document.createRange();
            const node = document.getElementById('executive-summary');
            range.selectNodeContents(node);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        """)

        page.mouse.up()
        time.sleep(1)

        expect(copy_link_btn).to_be_visible()
        copy_link_btn.click(force=True)

        # Check toast message
        expect(toast).to_be_visible()
        text = toast.inner_text()
        print(f"Toast message for long selection: {text}")

        page.screenshot(path="verification/before_fix.png")

        browser.close()

if __name__ == "__main__":
    run()
