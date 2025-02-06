import React, { useState } from "react";
import { createCandidate } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";
import CandidatesList from "./CandidatesList";

const JobsList: React.FC = () => {
  const {
    jobs,
    loading,
    error,
    addedJobs,
    loadingJobs,
    showBestFit,
    linkedinContext,
    name,
    publicIdentifier,
    setError,
    setAddedJobs,
    setLoadingJobs,
    setShowBestFit,
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
      let response;
      if (name && linkedinContext && publicIdentifier) {
        console.log("name");
        response = await createCandidate(
          jobId,
          currentUrl,
          name,
          linkedinContext,
          publicIdentifier
        );
      } else {
        console.log("url");
        response = await createCandidate(jobId, currentUrl);
      }
      if (response === null) {
        setError("not_authenticated");
        return;
      }
      setAddedJobs((prev) => new Set([...prev, jobId]));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create candidate"
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

  if (!currentUrl.includes("linkedin.com/in/")) return null;

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
      title="Add this candidate to Styx"
      onAddCandidate={handleCreateCandidate}
      onViewCandidates={handleViewCandidates}
      isAdded={(id: string) => addedJobs.has(id)}
      isLoading={(id: string) => loadingJobs.has(id)}
      jobs={jobs}
      loading={loading}
      error={error}
      showBestFit={showBestFit}
      onBestFitChange={setShowBestFit}
      selectedJobId={selectedJobId || undefined}
    />
  );
};

export default JobsList;


