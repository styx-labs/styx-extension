import React, { useState } from "react";
import { useJobsState } from "../../hooks/useJobsState";
import JobsActionPanel from "./JobsActionPanel";
import CandidatesList from "./CandidatesList";

const FallbackView: React.FC = () => {
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

  const handleViewCandidates = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
  };

  return (
    <JobsActionPanel
      title="Add Candidate"
      jobs={jobs}
      loading={loading}
      error={error}
      onAddCandidate={() => {}}
      onViewCandidates={handleViewCandidates}
      isAdded={() => false}
      isLoading={() => false}
      isProcessing={false}
      enableAddPage={false}
      enableAddNumber={false}
      enableAddSelected={false}
      maxPerPage={1}
      customAddMessage="Please navigate to a profile, search, company people, or recruiter search page to add candidates"
    />
  );
};

export default FallbackView;
