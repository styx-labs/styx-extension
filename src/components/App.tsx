import React, { useEffect, useState } from "react";
import JobsList from "./Jobs/JobsList";
import BulkJobsList from "./Jobs/BulkJobsList";

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );
  const [currentUrl, setCurrentUrl] = useState("");

  React.useEffect(() => {
    setCurrentUrl(window.location.href);

    const observer = new MutationObserver(() => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        setCurrentUrl(newUrl);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [currentUrl]);

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for URL changes
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  if (currentPath.includes("/in")) {
    return <JobsList />;
  }

  if (currentPath.includes("/search/results/people")) {
    return <BulkJobsList />;
  }

  return null;
};

export default App;
