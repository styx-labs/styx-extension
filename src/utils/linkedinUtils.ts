export const connectAndMessage = async (
  profileUrl: string,
  message: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "CONNECT_WITH_PROFILE", url: profileUrl, message: message },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      }
    );
  });
};
