import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import SingleProfileView from "./components/Jobs/SingleProfileView";
import SearchView from "./components/Jobs/SearchView";
import RecruiterSearchView from "./components/Jobs/RecruiterSearchView";
import CompanyView from "./components/Jobs/CompanyView";
import FallbackView from "./components/Jobs/FallbackView";
import { LayoutProvider } from "./contexts/LayoutContext";
import { SettingsProvider } from "./contexts/SettingsContext";

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    <LayoutProvider>
      {children}
      <Toaster position="bottom-right" />
    </LayoutProvider>
  </SettingsProvider>
);

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

  const pathMatches = (patterns: (string | RegExp)[]) => {
    return patterns.some((pattern) =>
      typeof pattern === "string"
        ? currentPath.includes(pattern)
        : pattern.test(currentPath)
    );
  };

  const recruiterPaths = [
    "/talent/search",
    /\/talent\/hire\/[^/]+\/discover\/recruiterSearch/,
    /\/talent\/hire\/[^/]+\/discover\/automatedSourcing/,
    /\/talent\/hire\/[^/]+\/manage/,
  ];

  if (pathMatches(recruiterPaths)) {
    return (
      <PageLayout>
        <RecruiterSearchView
          enableAddPage={true}
          enableAddNumber={true}
          enableAddSelected={true}
          maxPerPage={25}
        />
      </PageLayout>
    );
  }

  if (pathMatches(["/in"])) {
    return (
      <PageLayout>
        <SingleProfileView />
      </PageLayout>
    );
  }

  if (pathMatches(["/search/results/people"])) {
    return (
      <PageLayout>
        <SearchView
          enableAddPage={true}
          enableAddNumber={true}
          enableAddSelected={false}
          maxPerPage={10}
        />
      </PageLayout>
    );
  }

  if (pathMatches([/company\/[^/]+\/people/])) {
    return (
      <PageLayout>
        <CompanyView
          enableAddPage={false}
          enableAddNumber={true}
          enableAddSelected={false}
          maxPerPage={10}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <FallbackView />
    </PageLayout>
  );
};

export default App;
