import React, { useState } from "react";
import { createCandidate } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import CandidatesList from "./CandidatesList";

const JobsList: React.FC = () => {
  const {
    jobs,
    loading,
    error,
    addedJobs,
    loadingJobs,
    setError,
    setAddedJobs,
    setLoadingJobs,
  } = useJobsState();

  const [isProcessing, setIsProcessing] = useState(false);
  const [useSearchMode, setUseSearchMode] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);

  const currentUrl = useUrlWatcher(() => {
    setAddedJobs(new Set());
    setLoadingJobs(new Set());
  });

  const getProfileUrl = () => {
    // For search mode, look for any profile link
    if (useSearchMode) {
      const profileLink = document.querySelector('a[href*="linkedin.com/in/"]');
      const href = profileLink?.getAttribute("href");
      if (!href) return null;

      const match = href.match(/\/in\/([^/?]+)/);
      if (!match) return null;

      return `https://www.linkedin.com/in/${match[1]}`;
    }

    // For profile page mode, get the current URL
    const path = window.location.pathname;
    const match = path.match(/\/in\/([^/?]+)/);
    if (!match) return null;

    return `https://www.linkedin.com/in/${match[1]}`;
  };

  const handleCreateCandidate = async (
    jobId: string,
    mode: "page" | "number" | "selected",
    count?: number,
    selectedIds?: string[]
  ) => {
    try {
      setLoadingJobs((prev) => new Set([...prev, jobId]));
      setIsProcessing(true);

      const profileUrl = getProfileUrl();
      if (!profileUrl) {
        setError("Could not find a valid LinkedIn profile URL");
        return;
      }

      console.log(`Adding profile: ${profileUrl}`);
      const result = await createCandidate(jobId, profileUrl);
      if (result === null) {
        setError("not_authenticated");
        return;
      }

      setAddedJobs((prev) => new Set([...prev, jobId]));
    } catch (err) {
      console.error("Error creating candidate:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create candidate"
      );
    } finally {
      setIsProcessing(false);
      setLoadingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleViewCandidates = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
  };

  return selectedJobId ? (
    <CandidatesList
      jobId={selectedJobId}
      jobTitle={selectedJobTitle || undefined}
    />
  ) : (
    <JobsContainer
      title="Add Candidate"
      jobs={jobs}
      loading={loading}
      error={error}
      onAddCandidate={handleCreateCandidate}
      onViewCandidates={handleViewCandidates}
      isAdded={(jobId) => addedJobs.has(jobId)}
      isLoading={(jobId) => loadingJobs.has(jobId)}
      isProcessing={isProcessing}
      useSearchMode={useSearchMode}
      onSearchModeChange={setUseSearchMode}
      enableAddPage={false}
      enableAddNumber={false}
      enableAddSelected={false}
      maxPerPage={1}
      isSingleMode={true}
    />
  );
};

export default JobsList;
