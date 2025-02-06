import React, { useState } from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import {
  scrollToBottom,
  nextPage,
  getProfileURLs,
  scrollToTop,
} from "../../utils/linkedinRecruiterUtils";

interface RecruiterBulkJobsListProps {
  enableAddPage?: boolean;
  enableAddNumber?: boolean;
  enableAddSelected?: boolean;
  maxPerPage?: number;
}

const RecruiterBulkJobsList: React.FC<RecruiterBulkJobsListProps> = ({
  enableAddPage = false,
  enableAddNumber = false,
  enableAddSelected = false,
  maxPerPage = 25,
}) => {
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
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    []
  );

  const currentUrl = useUrlWatcher(() => {
    if (!isProcessing) {
      setAddedJobs(new Set());
      setLoadingJobs(new Set());
    }
  });

  const handleCreateCandidate = async (
    jobId: string,
    mode: "page" | "number" | "selected",
    count?: number,
    selectedIds?: string[]
  ) => {
    try {
      setLoadingJobs((prev) => new Set([...prev, jobId]));
      setIsProcessing(true);

      switch (mode) {
        case "page":
          await scrollToBottom();
          const pageUrls = await getProfileURLs(false, 0, useSearchMode);
          if (pageUrls.length === 0) {
            setError("No profiles found to add");
            return;
          }
          console.log(
            `Successfully retrieved ${pageUrls.length} public profile URLs`
          );
          const pageResult = await createCandidatesBulk(
            jobId,
            pageUrls.slice(0, maxPerPage)
          );
          if (pageResult === null) {
            setError("not_authenticated");
            return;
          }
          setAddedJobs((prev) => new Set([...prev, jobId]));
          break;

        case "number":
          if (!count) break;
          let totalProcessed = 0;
          let failedAttempts = 0;
          const MAX_FAILED_ATTEMPTS = 3;

          while (
            totalProcessed < count &&
            failedAttempts < MAX_FAILED_ATTEMPTS
          ) {
            // Calculate remaining profiles needed
            const remainingProfiles = count - totalProcessed;

            // Get URLs from current page
            await scrollToBottom();
            const urls = await getProfileURLs(
              false,
              remainingProfiles,
              useSearchMode
            );

            if (urls.length === 0) {
              failedAttempts++;
              continue;
            }

            // Reset failed attempts since we found profiles
            failedAttempts = 0;

            console.log(
              `Processing ${urls.length} profiles from current page (${totalProcessed}/${count} total)`
            );

            // Send current batch
            const result = await createCandidatesBulk(jobId, urls);
            if (result === null) {
              setError("not_authenticated");
              return;
            }

            totalProcessed += urls.length;
            setAddedJobs((prev) => new Set([...prev, jobId]));

            // If we haven't reached our target, go to next page
            if (totalProcessed < count) {
              nextPage();
              // Wait for page transition
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
          }

          if (totalProcessed === 0) {
            setError("Could not retrieve any public profile URLs");
            return;
          }

          console.log(
            `Successfully processed ${totalProcessed} profiles out of ${count} requested`
          );
          break;

        case "selected":
          await scrollToBottom();
          const selectedUrls = await getProfileURLs(true, 0, useSearchMode);
          if (selectedUrls.length === 0) {
            setError("No selected profiles found to add");
            return;
          }
          console.log(
            `Successfully retrieved ${selectedUrls.length} selected public profile URLs`
          );
          const selectedResult = await createCandidatesBulk(
            jobId,
            selectedUrls
          );
          if (selectedResult === null) {
            setError("not_authenticated");
            return;
          }
          setAddedJobs((prev) => new Set([...prev, jobId]));
          break;
      }

      await scrollToTop();
    } catch (err) {
      console.error("Error creating candidates:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create candidates"
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

  return (
    <JobsContainer
      title="Add Candidates"
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
      enableAddPage={enableAddPage}
      enableAddNumber={enableAddNumber}
      enableAddSelected={enableAddSelected}
      maxPerPage={maxPerPage}
      selectedCandidateIds={selectedCandidateIds}
    />
  );
};

export default RecruiterBulkJobsList;
