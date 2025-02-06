import React, { useState } from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import CandidatesList from "./CandidatesList";

const BulkJobsList: React.FC = () => {
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

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);

  const currentUrl = useUrlWatcher(() => {
    setAddedJobs(new Set());
    setLoadingJobs(new Set());
  });

  const handleCreateCandidate = async (jobId: string) => {
    try {
      setLoadingJobs((prev) => new Set([...prev, jobId]));

      // Find all LinkedIn profile links on the page
      const links = Array.from(
        document.querySelectorAll('a[href*="linkedin.com/in/"]')
      )
        .map((a) => a.getAttribute("href"))
        .filter((href): href is string => {
          if (!href || !href.includes("/in/")) return false;
          // Check if the part after /in/ starts with ACoAA (which indicates a profile ID)
          const parts = href.split("/in/");
          if (parts.length !== 2) return false;
          const profilePart = parts[1].split("?")[0]; // Get the part before any query parameters
          return !profilePart.startsWith("ACoAA");
        })
        .map((href) => {
          // Clean up the URL to get just the base profile URL
          const parts = href.split("/in/");
          const profilePart = parts[1].split("?")[0]; // Remove query parameters
          return `https://www.linkedin.com/in/${profilePart}`;
        });

      // Deduplicate the links using Set
      const uniqueLinks = [...new Set(links)];
      console.log("Found unique profiles:", uniqueLinks);

      if (uniqueLinks.length === 0) {
        setError("No valid LinkedIn profile links found on this page");
        return;
      }

      // Send all URLs in one request
      const result = await createCandidatesBulk(jobId, uniqueLinks);
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
    }
  };

  const handleViewCandidates = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
  };

  return (
    <JobsContainer
      title="Add all search result profiles to Styx"
      onAddCandidate={handleCreateCandidate}
      onViewCandidates={handleViewCandidates}
      isAdded={(id: string) => addedJobs.has(id)}
      isLoading={(id: string) => loadingJobs.has(id)}
      jobs={jobs}
      loading={loading}
      error={error}
      selectedJobId={selectedJobId || undefined}
    />
  );
};

export default BulkJobsList;
