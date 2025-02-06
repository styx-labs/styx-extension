import React, { useState } from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import CandidatesList from "./CandidatesList";
import {
  scrollToBottom,
  scrollToTop,
  getProfileURLs,
} from "../../utils/linkedinRecruiterUtils";

const CompanyPeopleJobsList: React.FC = () => {
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
  const [numProfiles, setNumProfiles] = useState(25);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  const [useSelected, setUseSelected] = useState(false);
  const currentUrl = useUrlWatcher(() => {
    if (!isProcessing) {
      setAddedJobs(new Set());
      setLoadingJobs(new Set());
    }
  });

  const handleAddNCandidates = async (jobId: string) => {
    try {
      setIsProcessing(true);
      setLoadingJobs((prev) => new Set([...prev, jobId]));

      let urls: string[] = [];

      if (useSearchMode) {
        await scrollToBottom();
        urls = await getProfileURLs(false, numProfiles, true);
      } else {
        while (urls.length < numProfiles) {
          await scrollToBottom();
          const profileCards = Array.from(
            document.querySelectorAll(".org-people-profile-card__profile-info")
          );

          const newUrls = profileCards
            .map((card) => {
              const profileLink = card.querySelector('a[href*="/in/"]');
              const href = profileLink?.getAttribute("href");
              if (!href) return null;

              const match = href.match(/\/in\/([^/?]+)/);
              if (!match) return null;

              return `https://www.linkedin.com/in/${match[1]}`;
            })
            .filter((url): url is string => url !== null);

          // Add only new unique URLs
          urls = [...new Set([...urls, ...newUrls])];

          // If we haven't reached the target number and there's a "Show more" button, click it
          if (urls.length < numProfiles) {
            const showMoreButton = document.querySelector(
              "button.scaffold-finite-scroll__load-button"
            );
            if (!(showMoreButton instanceof HTMLElement)) {
              break; // No more content to load
            }
            showMoreButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // Trim to exact number requested
        urls = urls.slice(0, numProfiles);
      }

      if (urls.length === 0) {
        setError("Could not retrieve any public profile URLs");
        return;
      }

      console.log(`Successfully retrieved ${urls.length} public profile URLs`);

      const result = await createCandidatesBulk(jobId, urls);
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
      scrollToTop();
    }
  };

  const handleViewCandidates = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
  };

  if (
    !currentUrl.includes("linkedin.com/company/") ||
    !currentUrl.includes("/people")
  )
    return null;

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
          : `Add First ${numProfiles} Company Employees to Styx`
      }
      onAddCandidate={handleAddNCandidates}
      onViewCandidates={handleViewCandidates}
      isAdded={(id: string) => addedJobs.has(id)}
      isLoading={(id: string) => loadingJobs.has(id)}
      jobs={jobs}
      loading={loading}
      error={error}
      onNumProfilesChange={setNumProfiles}
      isProcessing={isProcessing}
      useSelected={useSelected}
      onAddSelectedChange={setUseSelected}
      selectedJobId={selectedJobId || undefined}
      useSearchMode={useSearchMode}
      onSearchModeChange={setUseSearchMode}
    />
  );
};

export default CompanyPeopleJobsList;
