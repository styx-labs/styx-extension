import { useState, useEffect } from "react";
import { getJobs, getRecommendedJobs, getLinkedinContext } from "../utils/apiUtils";
import type { Job } from "../types";

export interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string;
  addedJobs: Set<string>;
  loadingJobs: Set<string>;
  showBestFit: boolean;
  linkedinContext: string;
  name: string;
  publicIdentifier: string;
  setError: (error: string) => void;
  setAddedJobs: (
    value: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void;
  setLoadingJobs: (
    value: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void;
  setShowBestFit: (value: boolean) => void;
}

export const useJobsState = (): JobsState => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());
  const [loadingJobs, setLoadingJobs] = useState<Set<string>>(new Set());
  const [showBestFit, setShowBestFit] = useState(false);
  const [linkedinContext, setLinkedinContext] = useState("");
  const [name, setName] = useState("");
  const [publicIdentifier, setPublicIdentifier] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (showBestFit && !name && !publicIdentifier && !linkedinContext) {
          const linkedinResponse = await getLinkedinContext(window.location.href);
          setLinkedinContext(linkedinResponse?.context || '');
          setName(linkedinResponse?.name || '');
          setPublicIdentifier(linkedinResponse?.public_identifier || '');
        }
        const jobsList = showBestFit 
          ? await getRecommendedJobs(linkedinContext)
          : await getJobs();
          
        if (jobsList === null) {
          setJobs([]);
          setError("not_authenticated");
        } else {
          setJobs(jobsList.sort((a, b) => a.id.localeCompare(b.id)));
          setError("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchJobs();
  }, [showBestFit, linkedinContext, name, publicIdentifier]);

  return {
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
  };
};
