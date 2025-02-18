import React, { useState, useEffect } from "react";
import { createCandidate, getCandidates } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsActionPanel from "./JobsActionPanel";

const SingleProfileView: React.FC = () => {
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
  const [addingCandidateId, setAddingCandidateId] = useState<string | null>(
    null
  );
  const [existingJobIds, setExistingJobIds] = useState<Set<string>>(new Set());

  // Check for existing candidates when landing on the page
  useEffect(() => {
    const checkExistingCandidates = async () => {
      const profileId = getProfileId();
      if (!profileId) return;

      // Check each job for this candidate
      const existingIds = new Set<string>();

      for (const job of jobs) {
        try {
          const response = await getCandidates(job.id);
          if (response === null) continue;

          const existingCandidate = response.candidates.find(
            (c) => c.id === profileId
          );
          if (existingCandidate) {
            existingIds.add(job.id);
            setAddedJobs((prev) => new Set([...prev, job.id]));
          }
        } catch (err) {
          console.error(`Error checking job ${job.id}:`, err);
        }
      }

      setExistingJobIds(existingIds);
    };

    if (jobs.length > 0) {
      checkExistingCandidates();
    }
  }, [jobs]);

  // Add URL watcher to reset state when profile changes
  useUrlWatcher(() => {
    if (!isProcessing) {
      setAddedJobs(new Set());
      setLoadingJobs(new Set());
      setAddingCandidateId(null);
      setExistingJobIds(new Set());
    }
  });

  const getProfileUrl = () => {
    if (useSearchMode) {
      const profileLink = document.querySelector('a[href*="linkedin.com/in/"]');
      const href = profileLink?.getAttribute("href");
      if (!href) return null;

      const match = href.match(/\/in\/([^/?]+)/);
      if (!match) return null;

      return `https://www.linkedin.com/in/${match[1]}`;
    }

    const path = window.location.pathname;
    const match = path.match(/\/in\/([^/?]+)/);
    if (!match) return null;

    return `https://www.linkedin.com/in/${match[1]}`;
  };

  const getProfileId = () => {
    const profileLink = document.querySelector('a[href*="linkedin.com/in/"]');
    const href = profileLink?.getAttribute("href");
    if (!href) return null;

    const match = href.match(/\/in\/([^/?]+)/);
    if (!match) return null;

    return match[1];
  };

  const handleCreateCandidate = async (jobId: string) => {
    try {
      const profileId = getProfileId();
      if (!profileId) {
        setError("Could not determine profile ID");
        return;
      }

      // If candidate exists, just open their sidebar
      if (existingJobIds.has(jobId)) {
        setAddingCandidateId(profileId);
        return;
      }

      // If candidate doesn't exist, proceed with creation
      setLoadingJobs((prev) => new Set([...prev, jobId]));
      setIsProcessing(true);

      const profileUrl = getProfileUrl();
      if (!profileUrl) {
        setError("Could not find a valid LinkedIn profile URL");
        return;
      }

      const result = await createCandidate(jobId, profileUrl);
      if (result === null) {
        setError("not_authenticated");
        return;
      }

      // Start polling for the candidate
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
      const pollInterval = setInterval(async () => {
        try {
          attempts++;
          const response = await getCandidates(jobId);

          if (response === null) {
            clearInterval(pollInterval);
            setError("not_authenticated");
            return;
          }

          const candidate = response.candidates.find((c) => c.id === profileId);

          if (candidate && candidate.status === "complete") {
            clearInterval(pollInterval);
            setAddingCandidateId(profileId);
            setAddedJobs((prev) => new Set([...prev, jobId]));
            setExistingJobIds((prev) => new Set([...prev, jobId]));
            setIsProcessing(false);
            setLoadingJobs((prev) => {
              const newSet = new Set(prev);
              newSet.delete(jobId);
              return newSet;
            });
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setError("Timed out waiting for candidate to be processed");
            setIsProcessing(false);
            setLoadingJobs((prev) => {
              const newSet = new Set(prev);
              newSet.delete(jobId);
              return newSet;
            });
          }
        } catch (err) {
          clearInterval(pollInterval);
          console.error("Error polling for candidate:", err);
          setError("Failed to check candidate status");
          setIsProcessing(false);
          setLoadingJobs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      }, 2000);
    } catch (err) {
      console.error("Error creating candidate:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create candidate"
      );
      setIsProcessing(false);
      setLoadingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleViewCandidates = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  return (
    <JobsActionPanel
      title="Add Candidate"
      jobs={jobs}
      loading={loading}
      error={error}
      onAddCandidate={handleCreateCandidate}
      onViewCandidates={handleViewCandidates}
      isAdded={(jobId) => existingJobIds.has(jobId)}
      isLoading={(jobId) => loadingJobs.has(jobId)}
      isProcessing={isProcessing}
      useSearchMode={useSearchMode}
      onSearchModeChange={setUseSearchMode}
      enableAddPage={false}
      enableAddNumber={false}
      enableAddSelected={false}
      maxPerPage={1}
      isSingleMode={true}
      addingCandidateId={addingCandidateId}
      customButtonText={(jobId: string) =>
        existingJobIds.has(jobId) ? "Open Evaluation" : undefined
      }
    />
  );
};

export default SingleProfileView;
