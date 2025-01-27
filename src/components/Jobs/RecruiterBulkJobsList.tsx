import React, { useState } from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import {
  scrollToBottom,
  nextPage,
  getProfileURLs,
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

  const currentUrl = useUrlWatcher(() => {
    if (!isProcessing) {
      setAddedJobs(new Set());
      setLoadingJobs(new Set());
    }
  });

  const [useSelected, setUseSelected] = useState(false);
  const [numProfiles, setNumProfiles] = useState(25);

  const handleAddSelectedCandidates = async (jobId: string) => {
    try {
      setLoadingJobs((prev) => new Set([...prev, jobId]));
      setIsProcessing(true);

      // First scroll to load all results
      await scrollToBottom();

      // Get links of selected profiles
      const publicUrls = await getProfileURLs(true);

      if (publicUrls.length === 0) {
        setError(
          "No profiles selected. Please select profiles to add to Styx."
        );
        return;
      }

      if (publicUrls.length === 0) {
        setError("Could not retrieve any public profile URLs");
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
      window.scrollTo(0, 0);
    }
  };

  const handleAddNCandidates = async (jobId: string) => {
    try {
      setIsProcessing(true);
      setLoadingJobs((prev) => new Set([...prev, jobId]));

      // Use a local variable to control the flow since state updates are async
      let publicUrls: string[] = [];

      while (publicUrls.length < numProfiles) {
        const urls = await getProfileURLs(useSelected, numProfiles - publicUrls.length);
        if (urls.length === 0) {
          break;
        }
        publicUrls.push(...urls);
        
        if (publicUrls.length < numProfiles) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          nextPage();
        }
      }
      if (publicUrls.length === 0) {
        setError("Could not retrieve any public profile URLs");
        return;
      }

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
      window.scrollTo(0, 0);
    }
  };

  return (
    <JobsContainer
      title={useSelected ? "Add selected LinkedIn profiles to Styx" : `Add First ${numProfiles} LinkedIn profiles to Styx`}
      onAddCandidate={useSelected ? handleAddSelectedCandidates : handleAddNCandidates}
      isAdded={(id) => addedJobs.has(id)}
      isLoading={(id) => loadingJobs.has(id)}
      jobs={jobs}
      loading={loading}
      error={error}
      useSelected={useSelected}
      onAddSelectedChange={setUseSelected}
      onNumProfilesChange={setNumProfiles}
      isProcessing={isProcessing}
    />
  );
};

export default RecruiterBulkJobsList;
