import React from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import {
  scrollToBottom,
  getPublicProfileUrl,
  getSelectedProfileLinks,
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

  const currentUrl = useUrlWatcher(() => {
    setAddedJobs(new Set());
    setLoadingJobs(new Set());
  });

  const handleCreateCandidate = async (jobId: string) => {
    try {
      setLoadingJobs((prev) => new Set([...prev, jobId]));

      // First scroll to load all results
      await scrollToBottom();

      // Get links of selected profiles
      const profileLinks = getSelectedProfileLinks();

      if (profileLinks.length === 0) {
        setError(
          "No profiles selected. Please select profiles to add to Styx."
        );
        return;
      }

      console.log(`Processing ${profileLinks.length} selected profiles`);

      // Process each profile link to get its public URL
      const publicUrls: string[] = [];
      for (const profileLink of profileLinks) {
        const publicUrl = await getPublicProfileUrl(profileLink);
        if (publicUrl) {
          publicUrls.push(publicUrl);
        }
        // Add a small delay between processing profiles to avoid overwhelming
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (publicUrls.length === 0) {
        setError("Could not retrieve any public profile URLs");
        return;
      }

      console.log(
        `Successfully retrieved ${publicUrls.length} public profile URLs out of ${profileLinks.length} selected profiles`
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
      // Scroll back to the top after processing
      window.scrollTo(0, 0);
    }
  };

  return (
    <JobsContainer
      title="Add selected Recruiter LinkedIn profiles to Styx"
      onAddCandidate={handleCreateCandidate}
      isAdded={(id) => addedJobs.has(id)}
      isLoading={(id) => loadingJobs.has(id)}
      jobs={jobs}
      loading={loading}
      error={error}
    />
  );
};

export default RecruiterBulkJobsList;
