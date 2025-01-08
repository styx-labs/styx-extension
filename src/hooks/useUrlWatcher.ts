import { useState, useEffect } from "react";

export const useUrlWatcher = (onUrlChange?: () => void) => {
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const observer = new MutationObserver(() => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        setCurrentUrl(newUrl);
        onUrlChange?.();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [currentUrl, onUrlChange]);

  return currentUrl;
};
