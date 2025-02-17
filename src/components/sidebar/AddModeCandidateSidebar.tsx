import React, { useState, useEffect } from "react";
import type { Candidate } from "@/types";
import { CandidateSidebar } from "./CandidateSidebar";
import { getCandidates } from "@/utils/apiUtils";

interface AddModeCandidateSidebarProps {
  candidateId: string;
  jobId: string;
}

export const AddModeCandidateSidebar: React.FC<
  AddModeCandidateSidebarProps
> = ({ candidateId, jobId }) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: { email: boolean; message: boolean };
  }>({});

  const pollCandidate = async () => {
    try {
      const response = await getCandidates(jobId);
      if (response) {
        response.candidates.forEach((candidate) => {
          if (candidate.id === candidateId) {
            setCandidate(candidate);
          }
        });
      }
    } catch (error) {
      console.error("Error polling candidate:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const startPolling = () => {
      // Initial fetch
      pollCandidate();

      // Poll every 5 seconds
      pollInterval = setInterval(pollCandidate, 5000);
    };

    startPolling();

    // Cleanup
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [candidateId, jobId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    // Implement delete logic if needed for add mode
    console.log("Delete not implemented in add mode");
  };

  if (!candidate) {
    return null;
  }

  const onClose = () => {
    setCandidate(null);
  };

  return (
    <CandidateSidebar
      candidate={candidate}
      onClose={onClose}
      loadingStates={loadingStates}
      handleDelete={handleDelete}
      jobId={jobId}
    />
  );
};
