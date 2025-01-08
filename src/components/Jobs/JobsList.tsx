import React from "react";
import { createCandidate } from "../../utils/apiUtils";
import { useJobsState } from "../../hooks/useJobsState";
import { useUrlWatcher } from "../../hooks/useUrlWatcher";
import JobsContainer from "./JobsContainer";

const JobsList: React.FC = () => {
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
      const response = await createCandidate(jobId, currentUrl);
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

  return (
    <JobsContainer
      title="Click to add this candidate to a job"
      onAddCandidate={handleCreateCandidate}
      isAdded={(id) => addedJobs.has(id)}
      isLoading={(id) => loadingJobs.has(id)}
      jobs={jobs}
      loading={loading}
      error={error}
    />
  );
};

export default JobsList;
