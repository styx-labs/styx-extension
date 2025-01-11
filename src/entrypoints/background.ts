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
  });
});
