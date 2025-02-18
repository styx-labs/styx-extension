import React, { useState, useEffect } from "react";
import type { Candidate } from "@/types";
import { CandidateSidebar } from "./CandidateSidebar";
import { getCandidate, deleteCandidate } from "@/utils/apiUtils";

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
      const foundCandidate = await getCandidate(jobId, candidateId);
      if (foundCandidate) {
        setCandidate(foundCandidate);
        // If the candidate is complete, stop loading
        if (foundCandidate.status === "complete") {
          setLoading(false);
          return true; // Signal to stop polling
        }
      } else if (foundCandidate === null) {
        // Candidate not found (404)
        setLoading(false);
        return true; // Stop polling
      }
      return false; // Continue polling
    } catch (error) {
      console.error("Error polling candidate:", error);
      setLoading(false);
      return true; // Stop polling on error
    }
  };

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const startPolling = async () => {
      // Initial fetch
      const shouldStop = await pollCandidate();
      if (shouldStop) return;

      // Poll every 5 seconds if not complete
      pollInterval = setInterval(async () => {
        const shouldStop = await pollCandidate();
        if (shouldStop && pollInterval) {
          clearInterval(pollInterval);
        }
      }, 5000);
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
    e.stopPropagation();
    if (!id || !jobId) return;
    try {
      await deleteCandidate(jobId, id);
      setCandidate(null);
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
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
