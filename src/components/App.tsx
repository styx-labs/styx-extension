import React, { useEffect, useState } from "react";
import { useExtensionState } from "@/hooks/useExtensionState";
import { Toaster } from "react-hot-toast";
import JobsList from "./Jobs/JobsList";
import { CandidatesList } from "./Jobs/CandidatesList";
import BulkJobsList from "./Jobs/BulkJobsList";
import RecruiterBulkJobsList from "./Jobs/RecruiterBulkJobsList";

interface JobsListProps {
  onSelectJob: (jobId: string, jobTitle: string) => void;
}

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

  if (
    currentPath.includes("/talent/search") ||
    /\/talent\/hire\/[^/]+\/discover\/recruiterSearch/.test(currentPath) ||
    /\/talent\/hire\/[^/]+\/discover\/automatedSourcing/.test(currentPath) ||
    /\/talent\/hire\/[^/]+\/manage/.test(currentPath)
  ) {
    return (
      <>
        <RecruiterBulkJobsList />
        <Toaster position="bottom-right" />
      </>
    );
  }

  if (currentPath.includes("/in")) {
    return (
      <>
        <JobsList />
        <Toaster position="bottom-right" />
      </>
    );
  }

  if (currentPath.includes("/search/results/people")) {
    return (
      <>
        <BulkJobsList />
        <Toaster position="bottom-right" />
      </>
    );
  }

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isExpanded ? "w-[600px]" : "w-20"
        }`}
      >
        {selectedJobId ? (
          <CandidatesList
            jobId={selectedJobId}
            onBack={() => setSelectedJobId(null)}
            jobTitle={selectedJobTitle || undefined}
          />
        ) : null}
      </div>
      <Toaster position="bottom-right" />
    </>
  );
};

export default App;
