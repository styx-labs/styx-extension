import React, { useEffect, useState } from "react";
import { useExtensionState } from "@/hooks/useExtensionState";
import { Toaster } from "react-hot-toast";
import JobsList from "./components/Jobs/JobsList";
import BulkJobsList from "./components/Jobs/BulkJobsList";
import RecruiterBulkJobsList from "./components/Jobs/RecruiterBulkJobsList";
import CompanyPeopleJobsList from "./components/Jobs/CompanyPeopleJobsList";

interface JobsListProps {
  onSelectJob: (jobId: string, jobTitle: string) => void;
}

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <Toaster position="bottom-right" />
  </>
);

const App: React.FC = () => {
  const { isExpanded } = useExtensionState();
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);

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
        <RecruiterBulkJobsList
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
        <JobsList />
      </PageLayout>
    );
  }

  if (pathMatches(["/search/results/people"])) {
    return (
      <PageLayout>
        <BulkJobsList
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
        <CompanyPeopleJobsList
          enableAddPage={false}
          enableAddNumber={true}
          enableAddSelected={false}
          maxPerPage={0}
        />
      </PageLayout>
    );
  }

  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
};

export default App;
