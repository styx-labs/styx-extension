import React from "react";
import { createCandidatesBulk } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";

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

  const scrollToBottom = async (): Promise<void> => {
    return new Promise((resolve) => {
      let previousHeight = 0;
      const checkAndScroll = setInterval(() => {
        const scrollingElement = document.scrollingElement;
        if (!scrollingElement) {
          clearInterval(checkAndScroll);
          resolve();
          return;
        }

        const currentHeight = scrollingElement.scrollHeight;
        window.scrollTo(0, currentHeight);

        // If height hasn't changed in the last scroll, we've reached the bottom
        if (currentHeight === previousHeight) {
          clearInterval(checkAndScroll);
          resolve();
          return;
        }

        previousHeight = currentHeight;
      }, 1000); // Check every second
    });
  };

  const getPublicProfileUrl = async (
    profileUrl: string
  ): Promise<string | null> => {
    try {
      // Create a hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      // Load the profile URL in the iframe
      return new Promise((resolve) => {
        // Set up a timeout to prevent hanging
        const timeout = setTimeout(() => {
          iframe.remove();
          resolve(null);
        }, 10000); // 10 second timeout

        iframe.onload = async () => {
          try {
            if (!iframe.contentWindow) {
              clearTimeout(timeout);
              iframe.remove();
              resolve(null);
              return;
            }

            // Wait a bit for the page to fully render
            await new Promise((r) => setTimeout(r, 1000));

            // Click the public profile button
            const publicProfileBtn = iframe.contentDocument?.querySelector(
              "#topcard-public-profile-hoverable-btn"
            );
            if (publicProfileBtn instanceof HTMLElement) {
              publicProfileBtn.click();
            }

            // Wait for the popup to appear
            await new Promise((r) => setTimeout(r, 500));

            // Get the public profile URL
            const publicProfileLink = iframe.contentDocument?.querySelector(
              ".topcard-condensed__public-profile-hovercard"
            );
            const publicUrl = publicProfileLink?.getAttribute("href") || null;

            clearTimeout(timeout);
            iframe.remove();
            resolve(publicUrl);
          } catch (error) {
            console.error("Error processing iframe:", error);
            clearTimeout(timeout);
            iframe.remove();
            resolve(null);
          }
        };

        iframe.src = profileUrl;
      });
    } catch (error) {
      console.error("Error getting public profile URL:", error);
      return null;
    }
  };

  const getSelectedProfileLinks = (): string[] => {
    // Find all profile list items
    const profileItems = Array.from(
      document.querySelectorAll(".profile-list-item")
    );

    // Filter to only get selected profiles and extract their links
    return profileItems
      .filter((item) => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        return checkbox instanceof HTMLInputElement && checkbox.checked;
      })
      .map((item) => {
        const profileLink = item.querySelector('a[href*="/talent/profile/"]');
        return profileLink?.getAttribute("href");
      })
      .filter((href): href is string => !!href);
  };

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
