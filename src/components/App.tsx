import React, { useEffect, useState } from "react";
import JobsList from "./Jobs/JobsList";
import BulkJobsList from "./Jobs/BulkJobsList";
import RecruiterBulkJobsList from "./Jobs/RecruiterBulkJobsList";

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );

  useEffect(() => {
    // Update path immediately when component mounts
    setCurrentPath(window.location.pathname);

    // Function to handle URL changes
    const handleUrlChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
      }
    };

    // Create an observer for SPA navigation
    const observer = new MutationObserver(() => {
      handleUrlChange();
    });

    // Observe DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Listen for regular navigation
    window.addEventListener("popstate", handleUrlChange);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [currentPath]);

  if (
    currentPath.includes("/talent/search") ||
    /\d+\/discover\/recruiterSearch/.test(currentPath)
  ) {
    return <RecruiterBulkJobsList />;
  }

  if (currentPath.includes("/in")) {
    return <JobsList />;
  }

  if (currentPath.includes("/search/results/people")) {
    return <BulkJobsList />;
  }

  return null;
};

export default App;
