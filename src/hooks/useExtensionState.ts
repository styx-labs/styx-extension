import { useState, useEffect } from 'react';

export const useExtensionState = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Load expansion state from storage
  useEffect(() => {
    const loadState = async () => {
      const { isExpanded: savedState } = await chrome.storage.local.get('isExpanded');
      if (savedState !== undefined) {
        setIsExpanded(savedState);
      }
    };
    loadState();
  }, []);

  // Save expansion state
  const toggleExpansion = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    chrome.storage.local.set({ isExpanded: newState });
  };

  return {
    isExpanded,
    toggleExpansion,
  };
};