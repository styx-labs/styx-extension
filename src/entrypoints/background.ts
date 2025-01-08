export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_AUTH_TOKEN") {
      chrome.cookies
        .get({
          url: "https://app.styxlabs.co",
          name: "styxExtensionToken",
        })
        .then((cookie) => {
          sendResponse(cookie?.value || null);
        });
      return true; // Keep channel open for async response
    }

    if (request.type === "OPEN_LOGIN") {
      chrome.tabs.create({ url: "https://app.styxlabs.co/login" });
    }
  });
});
