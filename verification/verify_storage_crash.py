import time
from playwright.sync_api import sync_playwright

def verify_storage_crash():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Mock localStorage to throw errors
        page.add_init_script("""
            Object.defineProperty(window, 'localStorage', {
                value: {
                    getItem: () => { throw new Error('Access denied'); },
                    setItem: () => { throw new Error('Access denied'); },
                    removeItem: () => { throw new Error('Access denied'); }
                },
                writable: false
            });
        """)

        errors = []
        page.on("pageerror", lambda err: errors.append(f"Page Error: {err}"))
        page.on("console", lambda msg: errors.append(f"Console Error: {msg.text}") if msg.type == "error" else None)

        try:
            # Load the article which has the audio player
            page.goto("http://localhost:8000/articles/flawed-democracy.html")

            # Wait a bit for JS to execute
            page.wait_for_timeout(2000)

            # Check if audio player controls are present
            controls_count = page.locator(".custom-audio-controls").count()

            print(f"Controls found: {controls_count}")
            print(f"Errors found: {len(errors)}")
            for err in errors:
                print(err)

            if len(errors) > 0:
                print("FAILURE: Errors detected.")
            else:
                print("SUCCESS: No errors detected.")

            # If controls are missing, it's a failure (player didn't init)
            if controls_count == 0:
                print("FAILURE: Audio player failed to initialize.")
            else:
                print("SUCCESS: Audio player initialized.")

        except Exception as e:
            print(f"Test failed with exception: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_storage_crash()
