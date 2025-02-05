import React, { useState } from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import CandidatesList from "./CandidatesList";
import {
  scrollToBottom,
  nextPage,
  getProfileURLs,
  scrollToTop,
} from "../../utils/linkedinRecruiterUtils";

const RecruiterBulkJobsList: React.FC = () => {
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
  const [useSelected, setUseSelected] = useState(false);
  const [useSearchMode, setUseSearchMode] = useState(false);
  const [numProfiles, setNumProfiles] = useState(25);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);

  const currentUrl = useUrlWatcher(() => {
    if (!isProcessing) {
      setAddedJobs(new Set());
      setLoadingJobs(new Set());
    }
  });

  const handleAddSelectedCandidates = async (jobId: string) => {
    try {
      setLoadingJobs((prev) => new Set([...prev, jobId]));
      setIsProcessing(true);

      // First scroll to load all results
      await scrollToBottom();

      // Get links of selected profiles
      const publicUrls = await getProfileURLs(true, 0, useSearchMode);

      if (publicUrls.length === 0) {
        setError(
          "No profiles selected. Please select profiles to add to Styx."
        );
        return;
      }

      console.log(
        `Successfully retrieved ${publicUrls.length} public profile URLs out of ${publicUrls.length} selected profiles`
      );

      // Send all URLs in one request
      const result = await createCandidatesBulk(jobId, publicUrls);
      if (result === null) {
        setError("not_authenticated");
        return;
      }

      setAddedJobs((prev) => new Set([...prev, jobId]));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create candidates"
      );
    } finally {
      setLoadingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      setIsProcessing(false);
      // Scroll back to the top after processing
      scrollToTop();
    }
  };

  const handleAddNCandidates = async (jobId: string) => {
    try {
      setIsProcessing(true);
      setLoadingJobs((prev) => new Set([...prev, jobId]));

      let totalProcessed = 0;
      let failedAttempts = 0;
      const MAX_FAILED_ATTEMPTS = 3;

      while (
        totalProcessed < numProfiles &&
        failedAttempts < MAX_FAILED_ATTEMPTS
      ) {
        // Calculate how many more profiles we need
        const remainingProfiles = numProfiles - totalProcessed;

        // Get URLs from current page, limiting to remaining needed profiles
        const urls = await getProfileURLs(
          useSelected,
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
          `Processing ${urls.length} profiles from current page (${totalProcessed}/${numProfiles} total)`
        );

        // Send current batch of URLs
        const result = await createCandidatesBulk(jobId, urls);
        if (result === null) {
          setError("not_authenticated");
          return;
        }

        totalProcessed += urls.length;

        // Update added jobs set
        setAddedJobs((prev) => new Set([...prev, jobId]));

        // If we haven't reached our target, go to next page
        if (totalProcessed < numProfiles) {
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
        `Successfully processed ${totalProcessed} profiles out of ${numProfiles} requested`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create candidates"
      );
    } finally {
      setLoadingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      setIsProcessing(false);
      // Scroll back to the top after processing
      scrollToTop();
    }
  };

  const handleViewCandidates = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
  };

  if (selectedJobId) {
    return (
      <CandidatesList
        jobId={selectedJobId}
        jobTitle={selectedJobTitle || undefined}
        onBack={() => {
          setSelectedJobId(null);
          setSelectedJobTitle(null);
        }}
      />
    );
  }

  return (
    <JobsContainer
      title={
        useSelected
          ? "Add selected LinkedIn profiles to Styx"
          : `Add First ${numProfiles} LinkedIn profiles to Styx`
      }
      onAddCandidate={
        useSelected ? handleAddSelectedCandidates : handleAddNCandidates
      }
      onViewCandidates={handleViewCandidates}
      isAdded={(id: string) => addedJobs.has(id)}
      isLoading={(id: string) => loadingJobs.has(id)}
      jobs={jobs}
      loading={loading}
      error={error}
      useSelected={useSelected}
      onAddSelectedChange={setUseSelected}
      onNumProfilesChange={setNumProfiles}
      isProcessing={isProcessing}
      useSearchMode={useSearchMode}
      onSearchModeChange={setUseSearchMode}
      selectedJobId={selectedJobId || undefined}
    />
  );
};

export default RecruiterBulkJobsList;
