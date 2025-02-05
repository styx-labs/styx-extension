export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_AUTH_TOKEN") {
      chrome.cookies
        .get({
          url: `${import.meta.env.VITE_FRONTEND_URL}/`,
          name: "styxExtensionToken",
        })
        .then(async (cookie) => {
          if (cookie?.value) {
            sendResponse(cookie.value);
            return;
          }
          sendResponse(null);
        });
      return true; // Keep channel open for async response
    }

    if (request.type === "OPEN_LOGIN") {
      chrome.tabs.create({ url: `${import.meta.env.VITE_FRONTEND_URL}/login` });
    }

    if (request.type === "CONNECT_WITH_PROFILE") {
      handleConnectWithProfile(request.url, request.message);
      sendResponse({ success: true });
      return true; // Keep channel open for async response
    }
  });
});

async function handleConnectWithProfile(profileUrl: string, message: string) {
  // Open the profile in a new tab
  const tab = await chrome.tabs.create({ url: profileUrl });

  // Wait for the page to load and then inject our content script
  chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
    if (tabId === tab.id && info.status === "complete") {
      // Remove the listener since we only need it once
      chrome.tabs.onUpdated.removeListener(listener);

      // Execute our connection script
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [message],
        func: async (message) => {
          // Helper function to wait for an element
          const waitForElement = (
            selector: string,
            timeout: number = 3000
          ): Promise<Element | null> => {
            return new Promise((resolve) => {
              const checkElement = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) {
                  clearInterval(checkElement);
                  resolve(element);
                }
              }, 500);

              setTimeout(() => {
                clearInterval(checkElement);
                resolve(null);
              }, timeout);
            });
          };

          // Helper function to wait for and find element by text content
          const waitForElementByText = (
            selector: string,
            text: string
          ): Promise<Element> => {
            return new Promise((resolve) => {
              const checkElement = setInterval(() => {
                const elements = document.querySelectorAll(selector);
                const element = Array.from(elements).find(
                  (el) => el.textContent?.trim() === text
                );
                if (element) {
                  clearInterval(checkElement);
                  resolve(element);
                }
              }, 500);
            });
          };

          try {
            // Try both paths in parallel
            await Promise.race([
              // Direct connect button path
              (async () => {
                const connectButton = await waitForElement(
                  'button[aria-label*="connect" i].artdeco-button--primary',
                  5000
                );
                if (connectButton) {
                  (connectButton as HTMLElement).click();
                  return true;
                }
                return false;
              })(),

              // More options path
              (async () => {
                const moreButton = await waitForElement(
                  'button[aria-label="More actions"]',
                  5000
                );
                if (!moreButton) return false;

                (moreButton as HTMLElement).click();

                // Wait a bit for the dropdown to appear
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Look for Connect in dropdown
                const connectOption = await waitForElementByText(
                  ".artdeco-dropdown__content span.display-flex.t-normal.flex-1",
                  "Connect"
                );

                if (connectOption) {
                  (connectOption as HTMLElement).click();
                  return true;
                }

                // If not in dropdown, check for "View more" button
                const viewMoreButton = await waitForElementByText(
                  "button span",
                  "View more actions"
                );
                if (!viewMoreButton) return false;

                (viewMoreButton.closest("button") as HTMLElement).click();
                // Wait for expanded menu
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Now look for Connect in expanded menu
                const expandedConnectOption = await waitForElementByText(
                  ".artdeco-dropdown__content span.display-flex.t-normal.flex-1",
                  "Connect"
                );
                if (!expandedConnectOption) return false;

                (expandedConnectOption as HTMLElement).click();
                return true;
              })(),
            ]);

            // Wait for and click the "Add a note" button
            const addNoteButton = await waitForElement(
              'button[aria-label="Add a note"]'
            );
            if (!addNoteButton) {
              return;
            }
            (addNoteButton as HTMLElement).click();

            // Wait for and fill the message textarea
            const messageInput = await waitForElement(
              "textarea#custom-message"
            );
            if (!messageInput) {
              return;
            }
            (messageInput as HTMLTextAreaElement).value = message;
            // Trigger input event to ensure LinkedIn registers the change
            const inputEvent = new Event("input", { bubbles: true });
            messageInput.dispatchEvent(inputEvent);

            // Find and click the send button
            const sendButton = await waitForElement(
              'button[aria-label="Send now"]'
            );
            if (!sendButton) {
              return;
            }
            (sendButton as HTMLElement).click();
          } catch (error) {
            console.error("Error connecting to profile:", error);
          }
        },
      });
    }
  });
}
