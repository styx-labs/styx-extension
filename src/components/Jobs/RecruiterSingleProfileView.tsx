import React, { useState, useEffect } from "react";
import { createCandidate, getCandidate } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import { useSettings } from "../../contexts/SettingsContext";
import JobsActionPanel from "./JobsActionPanel";
import type { Candidate } from "../../types";
interface GetCandidateResponse {
  success: boolean;
  candidate: Candidate | null;
}

const SELECTED_JOB_KEY = "styx-selected-job-id";

const RecruiterSingleProfileView: React.FC = () => {
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

  const { autoMode } = useSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(() => {
    // Initialize with saved job ID if it exists and is valid
    const savedJobId = localStorage.getItem(SELECTED_JOB_KEY);
    return savedJobId && jobs.some((job) => job.id === savedJobId)
      ? savedJobId
      : undefined;
  });
  const [addingCandidateId, setAddingCandidateId] = useState<string | null>(
    null
  );
  const [existingCandidate, setExistingCandidate] = useState<boolean>(false);

  // Add URL watcher to reset state when profile changes
  useUrlWatcher(() => {
    if (!isProcessing) {
      setAddedJobs(new Set());
      setLoadingJobs(new Set());
      setAddingCandidateId(null);
      setExistingCandidate(false);

      // Auto-add candidate if auto mode is enabled and we have a selected job
      if (autoMode && selectedJobId) {
        console.log("Adding candidate to job", selectedJobId);
        handleCreateCandidate(selectedJobId);
      }
    }
  });

  // Update selectedJobId when jobs load
  useEffect(() => {
    if (!loading && jobs.length > 0) {
      const savedJobId = localStorage.getItem(SELECTED_JOB_KEY);
      if (savedJobId && jobs.some((job) => job.id === savedJobId)) {
        setSelectedJobId(savedJobId);
      }
    }
  }, [loading, jobs]);

  const getProfileUrl = async () => {
    // Try up to 5 times with a 1 second delay between attempts
    for (let attempt = 0; attempt < 5; attempt++) {
      // First try to get the URL from the public profile link in the hoverable content
      const publicProfileLink = document.querySelector(
        "a[data-test-public-profile-link]"
      );
      if (
        publicProfileLink instanceof HTMLAnchorElement &&
        publicProfileLink.href
      ) {
        return publicProfileLink.href;
      }

      // If not found, wait 1 second before trying again
      if (attempt < 4) {
        // Don't wait on the last attempt
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return null;
  };

  const getProfileId = async () => {
    const url = await getProfileUrl();
    if (!url) return null;
    const match = url.match(/\/in\/([^/?]+)/);
    if (!match) return null;
    return match[1];
  };

  const handleCreateCandidate = async (jobId: string) => {
    try {
      setLoadingJobs((prev) => new Set([...prev, jobId]));
      setIsProcessing(true);

      // Get the profile ID first
      const profileId = await getProfileId();
      if (!profileId) {
        setError("Could not determine profile ID");
        return;
      }

      // Check if candidate already exists
      const response = (await getCandidate(
        jobId,
        profileId
      )) as unknown as GetCandidateResponse;
      if (response?.success && response?.candidate) {
        // Candidate exists, show the sidebar
        setExistingCandidate(true);
        setAddingCandidateId(profileId);
        setAddedJobs((prev) => new Set([...prev, jobId]));
        setIsProcessing(false);
        setLoadingJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        return;
      }

      // If candidate doesn't exist, create them
      const profileUrl = await getProfileUrl();
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
          const pollResponse = (await getCandidate(
            jobId,
            profileId
          )) as unknown as GetCandidateResponse;

          // If we get a successful response with a candidate, check its status
          if (pollResponse?.success && pollResponse?.candidate) {
            if (pollResponse.candidate.status === "complete") {
              clearInterval(pollInterval);
              setAddingCandidateId(profileId);
              setAddedJobs((prev) => new Set([...prev, jobId]));
              setExistingCandidate(true);
              setIsProcessing(false);
              setLoadingJobs((prev) => {
                const newSet = new Set(prev);
                newSet.delete(jobId);
                return newSet;
              });
            } else if (attempts >= maxAttempts) {
              // We have a candidate but it's not complete after max attempts
              clearInterval(pollInterval);
              setError("Timed out waiting for candidate to be processed");
              setIsProcessing(false);
              setLoadingJobs((prev) => {
                const newSet = new Set(prev);
                newSet.delete(jobId);
                return newSet;
              });
            }
            // If we have a candidate but it's not complete and we haven't hit max attempts,
            // continue polling
            return;
          }

          // If we get a success:false response and hit max attempts, show error
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setError("Candidate creation timed out - please try again");
            setIsProcessing(false);
            setLoadingJobs((prev) => {
              const newSet = new Set(prev);
              newSet.delete(jobId);
              return newSet;
            });
          }
          // If we get success:false but haven't hit max attempts, continue polling
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
      isAdded={(jobId) => addedJobs.has(jobId)}
      isLoading={(jobId) => loadingJobs.has(jobId)}
      isProcessing={isProcessing}
      useSearchMode={false}
      onSearchModeChange={() => {}}
      enableAddPage={false}
      enableAddNumber={false}
      enableAddSelected={false}
      maxPerPage={1}
      isSingleMode={true}
      addingCandidateId={addingCandidateId}
    />
  );
};

export default RecruiterSingleProfileView;
