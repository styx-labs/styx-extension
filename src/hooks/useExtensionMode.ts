import { useState, useEffect } from "react";

type Mode = "add" | "view";

const STORAGE_KEY = "extension_mode";

export const useExtensionMode = () => {
  const [mode, setMode] = useState<Mode>("add");

  useEffect(() => {
    // Load initial mode from storage
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        setMode(result[STORAGE_KEY] as Mode);
      }
    });
  }, []);

  const updateMode = (newMode: Mode) => {
    setMode(newMode);
    chrome.storage.local.set({ [STORAGE_KEY]: newMode });
  };

  return {
    mode,
    setMode: updateMode,
  };
};
