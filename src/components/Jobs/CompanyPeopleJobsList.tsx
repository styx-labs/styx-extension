import React, { useState } from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import CandidatesList from "./CandidatesList";
import {
  scrollToBottom,
  scrollToTop,
} from "../../utils/linkedinRecruiterUtils";

interface CompanyPeopleJobsListProps {
  enableAddPage?: boolean;
  enableAddNumber?: boolean;
  enableAddSelected?: boolean;
  maxPerPage?: number;
}

const CompanyPeopleJobsList: React.FC<CompanyPeopleJobsListProps> = ({
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

  const getProfileUrls = () => {
    // Find all profile cards
    const profileCards = Array.from(
      document.querySelectorAll(".org-people-profile-card__profile-info")
    );

    // Extract profile URLs from cards
    const urls = profileCards
      .map((card) => {
        // Find the main profile link (the one with the person's name)
        const profileLink = card.querySelector(
          '.artdeco-entity-lockup__title a[href*="/in/"]'
        );
        const href = profileLink?.getAttribute("href");
        if (!href) return null;

        // Extract the profile path (/in/username) from the href
        const match = href.match(/\/in\/([^/?]+)/);
        if (!match) return null;

        return `https://www.linkedin.com/in/${match[1]}`;
      })
      .filter((url): url is string => url !== null);

    return [...new Set(urls)]; // Deduplicate URLs
  };

  const handleCreateCandidate = async (
    jobId: string,
    mode: "page" | "number" | "selected",
    count?: number,
    selectedIds?: string[]
  ) => {
    try {
      setIsProcessing(true);
      setLoadingJobs((prev) => new Set([...prev, jobId]));

      switch (mode) {
        case "number": {
          if (!count) break;
          let urls: string[] = [];

          while (urls.length < count) {
            await scrollToBottom();
            const pageUrls = getProfileUrls();

            // Add new unique URLs
            const uniqueUrls = pageUrls.filter((url) => !urls.includes(url));
            urls.push(...uniqueUrls);

            console.log(
              `Found ${pageUrls.length} profiles (${urls.length}/${count} total)`
            );

            // If we haven't reached the target number and there's a "Show more" button, click it
            if (urls.length < count) {
              const showMoreButton = document.querySelector(
                "button.scaffold-finite-scroll__load-button"
              );
              if (!(showMoreButton instanceof HTMLElement)) {
                console.log("No more profiles to load");
                break;
              }
              showMoreButton.click();
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          }

          if (urls.length === 0) {
            setError("Could not retrieve any public profile URLs");
            return;
          }

          console.log(
            `Successfully retrieved ${urls.length} public profile URLs`
          );
          const result = await createCandidatesBulk(
            jobId,
            urls.slice(0, count)
          );
          if (result === null) {
            setError("not_authenticated");
            return;
          }

          setAddedJobs((prev) => new Set([...prev, jobId]));
          break;
        }

        default:
          setError("Unsupported add mode for company people page");
          return;
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

  return selectedJobId ? (
    <CandidatesList
      jobId={selectedJobId}
      jobTitle={selectedJobTitle || undefined}
    />
  ) : (
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

export default CompanyPeopleJobsList;
