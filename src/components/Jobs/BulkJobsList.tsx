import React, { useState } from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";

interface BulkJobsListProps {
  enableAddPage?: boolean;
  enableAddNumber?: boolean;
  enableAddSelected?: boolean;
  maxPerPage?: number;
}

const BulkJobsList: React.FC<BulkJobsListProps> = ({
  enableAddPage = true,
  enableAddNumber = true,
  enableAddSelected = false,
  maxPerPage = 10,
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
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    []
  );

  const currentUrl = useUrlWatcher(() => {
    setAddedJobs(new Set());
    setLoadingJobs(new Set());
  });

  const getLinkedInProfileUrls = () => {
    const links = Array.from(
      document.querySelectorAll('a[href*="linkedin.com/in/"]')
    )
      .map((a) => a.getAttribute("href"))
      .filter((href): href is string => {
        if (!href || !href.includes("/in/")) return false;
        const parts = href.split("/in/");
        if (parts.length !== 2) return false;
        const profilePart = parts[1].split("?")[0];
        return !profilePart.startsWith("ACoAA");
      })
      .map((href) => {
        const parts = href.split("/in/");
        const profilePart = parts[1].split("?")[0];
        return `https://www.linkedin.com/in/${profilePart}`;
      });

    return [...new Set(links)]; // Deduplicate URLs
  };

  const goToNextPage = async () => {
    const nextButton = document.querySelector(
      "button.artdeco-pagination__button--next"
    );
    if (nextButton instanceof HTMLElement) {
      nextButton.click();
      // Wait for the page to load
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Scroll to top to ensure new results are loaded
      window.scrollTo(0, 0);
      // Wait a bit more for the results to render
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    }
    return false;
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

      switch (mode) {
        case "page": {
          const urls = getLinkedInProfileUrls();
          if (urls.length === 0) {
            setError("No profiles found to add");
            return;
          }

          console.log(
            `Successfully retrieved ${urls.length} public profile URLs`
          );
          const result = await createCandidatesBulk(
            jobId,
            urls.slice(0, maxPerPage)
          );
          if (result === null) {
            setError("not_authenticated");
            return;
          }
          setAddedJobs((prev) => new Set([...prev, jobId]));
          break;
        }

        case "number": {
          if (!count) break;
          let totalProcessed = 0;
          let failedAttempts = 0;
          const MAX_FAILED_ATTEMPTS = 3;

          while (
            totalProcessed < count &&
            failedAttempts < MAX_FAILED_ATTEMPTS
          ) {
            // Get URLs from current page
            const urls = getLinkedInProfileUrls();
            const remainingProfiles = count - totalProcessed;
            const urlsToProcess = urls.slice(0, remainingProfiles);

            if (urlsToProcess.length === 0) {
              failedAttempts++;
              // Try to go to next page
              const hasNextPage = await goToNextPage();
              if (!hasNextPage) {
                console.log("No more pages available");
                break;
              }
              continue;
            }

            // Reset failed attempts since we found profiles
            failedAttempts = 0;

            console.log(
              `Processing ${urlsToProcess.length} profiles from current page (${totalProcessed}/${count} total)`
            );

            // Send current batch
            const result = await createCandidatesBulk(jobId, urlsToProcess);
            if (result === null) {
              setError("not_authenticated");
              return;
            }

            totalProcessed += urlsToProcess.length;
            setAddedJobs((prev) => new Set([...prev, jobId]));

            // If we haven't reached our target, try to go to next page
            if (totalProcessed < count) {
              const hasNextPage = await goToNextPage();
              if (!hasNextPage) {
                console.log("No more pages available");
                break;
              }
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
        }

        case "selected": {
          if (!selectedIds?.length) {
            setError("No profiles selected to add");
            return;
          }

          const urls = getLinkedInProfileUrls().filter((url) =>
            selectedIds.includes(url)
          );

          if (urls.length === 0) {
            setError("No matching profiles found for selected IDs");
            return;
          }

          console.log(
            `Successfully retrieved ${urls.length} selected public profile URLs`
          );
          const result = await createCandidatesBulk(jobId, urls);
          if (result === null) {
            setError("not_authenticated");
            return;
          }
          setAddedJobs((prev) => new Set([...prev, jobId]));
          break;
        }
      }

      // Scroll back to top after processing
      window.scrollTo(0, 0);
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
      enableAddPage={enableAddPage}
      enableAddNumber={enableAddNumber}
      enableAddSelected={enableAddSelected}
      maxPerPage={maxPerPage}
      selectedCandidateIds={selectedCandidateIds}
    />
  );
};

export default BulkJobsList;
